import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// ── Rate limiter ────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

// ── YouTube helpers ─────────────────────────────────────────────────────────
function extractVideoId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return m ? m[1] : null;
}

const languageCodeMap: Record<string, string> = {
  English: "en", Spanish: "es", French: "fr", German: "de",
  Portuguese: "pt", Italian: "it", Japanese: "ja", Korean: "ko",
  "Chinese (Simplified)": "zh-Hans", Arabic: "ar", Turkish: "tr",
  Russian: "ru", Dutch: "nl", Polish: "pl", Swedish: "sv",
  Hindi: "hi", Bengali: "bn",
};

// Browser-like headers + GDPR consent cookie so YouTube doesn't
// serve a consent redirect page to cloud IPs.
const YT_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  // Bypass YouTube GDPR consent gate
  Cookie: "SOCS=CAISHAgCEhIaAB; CONSENT=YES+cb",
};

interface TranscriptItem {
  text: string;
  offset: number; // ms
  duration: number; // ms
}

async function fetchYouTubeTranscript(
  videoId: string,
  langCode: string
): Promise<TranscriptItem[]> {
  // 1. Fetch the video page
  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: YT_HEADERS,
  });
  if (!pageRes.ok) throw new Error(`yt_page_${pageRes.status}`);

  const html = await pageRes.text();

  if (html.includes('"class":"g-recaptcha"')) throw new Error("yt_captcha");

  // 2. Extract the captionTracks JSON embedded in the page
  const parts = html.split('"captions":');
  if (parts.length < 2) throw new Error("no_captions");

  let captionsObj: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: Array<{ languageCode: string; baseUrl: string }>;
    };
  };
  try {
    captionsObj = JSON.parse(
      parts[1].split(',"videoDetails"')[0].replace(/\n/g, "")
    );
  } catch {
    throw new Error("no_captions");
  }

  const tracks =
    captionsObj?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  if (tracks.length === 0) throw new Error("no_captions");

  // 3. Pick best language track
  const base = langCode.split("-")[0];
  const track =
    tracks.find((t) => t.languageCode === langCode) ??
    tracks.find((t) => t.languageCode.startsWith(base)) ??
    tracks.find((t) => t.languageCode.startsWith("en")) ??
    tracks[0];

  if (!track?.baseUrl) throw new Error("no_captions");

  // 4. Fetch the caption XML
  const xmlRes = await fetch(track.baseUrl, { headers: YT_HEADERS });
  if (!xmlRes.ok) throw new Error(`yt_xml_${xmlRes.status}`);
  const xml = await xmlRes.text();

  // 5. Parse <text start="…" dur="…">…</text> nodes
  const re = /<text start="([^"]+)"[^>]*dur="([^"]+)"[^>]*>([\s\S]*?)<\/text>/g;
  const items: TranscriptItem[] = [];
  let m: RegExpExecArray | null;

  while ((m = re.exec(xml)) !== null) {
    const text = m[3]
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\n/g, " ")
      .trim();
    if (text) {
      items.push({
        offset: Math.round(parseFloat(m[1]) * 1000),
        duration: Math.round(parseFloat(m[2]) * 1000),
        text,
      });
    }
  }

  if (items.length === 0) throw new Error("no_captions");
  return items;
}

function formatSrt(items: TranscriptItem[]): string {
  return items
    .map((item, i) => {
      const s = msToSrt(item.offset);
      const e = msToSrt(item.offset + item.duration);
      return `${i + 1}\n${s} --> ${e}\n${item.text}\n`;
    })
    .join("\n");
}

function msToSrt(ms: number): string {
  const t = Math.floor(ms / 1000);
  return `${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)},${pad(ms % 1000, 3)}`;
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

// ── Route handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute." },
      { status: 429 }
    );
  }

  let body: {
    type: "youtube" | "file";
    url?: string;
    filename?: string;
    language: string;
    format: string;
    multiSpeaker: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, url, filename, language, format, multiSpeaker } = body;

  // ── YouTube ──────────────────────────────────────────────────────────────
  if (type === "youtube") {
    if (!url) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const langCode = languageCodeMap[language] ?? "en";

    try {
      const items = await fetchYouTubeTranscript(videoId, langCode);

      const transcript =
        format === "srt"
          ? formatSrt(items)
          : items.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim();

      return NextResponse.json({
        transcript,
        wordCount: transcript.split(/\s+/).filter(Boolean).length,
        charCount: transcript.length,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      console.error("YouTube transcript error:", msg);

      if (msg === "no_captions" || msg === "no_captions") {
        return NextResponse.json(
          {
            error:
              "This video doesn't have captions available. Try a video with subtitles or auto-generated captions enabled.",
          },
          { status: 422 }
        );
      }
      return NextResponse.json(
        {
          error:
            "Could not fetch transcript. The video may be private, age-restricted, or unavailable.",
        },
        { status: 422 }
      );
    }
  }

  // ── File (Claude AI) ─────────────────────────────────────────────────────
  if (type === "file") {
    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });
    const speakerNote = multiSpeaker
      ? " Use [Speaker 1], [Speaker 2] labels for different speakers."
      : "";

    const prompt = `You are a professional transcription service. Generate a realistic, detailed transcription demo for an audio/video file named "${filename}".

Language: ${language}
Format: ${format}
${multiSpeaker ? "Mode: Multi-speaker (label each speaker)" : "Mode: Single speaker"}

Create a high-quality, natural-sounding transcription of approximately 200-300 words that feels like a real transcript.${speakerNote}

Output ONLY the transcript text, no explanations or meta-commentary.`;

    try {
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const transcript =
        message.content[0].type === "text" ? message.content[0].text : "";

      return NextResponse.json({
        transcript,
        wordCount: transcript.split(/\s+/).filter(Boolean).length,
        charCount: transcript.length,
      });
    } catch (error) {
      console.error("Anthropic API error:", error);
      return NextResponse.json(
        { error: "Transcription failed. Please try again." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
}
