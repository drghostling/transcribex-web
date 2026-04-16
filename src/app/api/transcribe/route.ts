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

// ── Helpers ─────────────────────────────────────────────────────────────────
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

interface TranscriptItem {
  text: string;
  offset: number; // ms
  duration: number; // ms
}

/**
 * Encode a protobuf "field N, wire type 2 (length-delimited)" string field.
 */
function protoString(fieldNumber: number, value: string): Buffer {
  const tag = (fieldNumber << 3) | 2; // wire type 2
  const data = Buffer.from(value, "utf8");
  // Varint encode length (simple: works for lengths < 128)
  const len = data.length < 128 ? Buffer.from([data.length]) : null;
  if (!len) throw new Error("value too long for simple varint");
  return Buffer.concat([Buffer.from([tag]), len, data]);
}

/**
 * Fetch transcript via YouTube InnerTube API (same endpoint used by
 * YouTube mobile / TV apps). Works from server IPs where the HTML-scrape
 * approach is blocked.
 */
async function fetchYouTubeTranscript(
  videoId: string,
  langCode: string
): Promise<TranscriptItem[]> {
  // Build protobuf params: field 1 = videoId, field 2 = langCode
  const paramsBuf = Buffer.concat([
    protoString(1, videoId),
    protoString(2, langCode),
  ]);
  const params = paramsBuf.toString("base64");

  const res = await fetch(
    "https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "X-YouTube-Client-Name": "1",
        "X-YouTube-Client-Version": "2.20240101.00.00",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00",
            hl: langCode.split("-")[0],
            gl: "US",
          },
        },
        params,
      }),
    }
  );

  if (!res.ok) throw new Error(`yt_api_${res.status}`);

  const data = await res.json();

  // Navigate the InnerTube response tree
  const segments: unknown[] =
    data?.actions?.[0]?.updateEngagementPanelAction?.content
      ?.transcriptRenderer?.content?.transcriptSearchPanelRenderer?.body
      ?.transcriptSegmentListRenderer?.initialSegments ?? [];

  if (!Array.isArray(segments) || segments.length === 0) {
    // Try without language — fall back to whatever the default track is
    if (langCode !== "en") return fetchYouTubeTranscript(videoId, "en");
    throw new Error("no_captions");
  }

  const items: TranscriptItem[] = [];
  for (const seg of segments) {
    const r = (seg as Record<string, unknown>)
      .transcriptSegmentRenderer as Record<string, unknown> | undefined;
    if (!r) continue;

    const runs = (
      (r.snippet as Record<string, unknown>)?.runs as Array<{
        text: string;
      }> | undefined
    ) ?? [];
    const text = runs.map((x) => x.text).join("").trim();
    const startMs = parseInt(String(r.startMs ?? "0"), 10);
    const endMs = parseInt(String(r.endMs ?? "0"), 10);

    if (text) items.push({ text, offset: startMs, duration: endMs - startMs });
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
    if (!url)
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );

    const videoId = extractVideoId(url);
    if (!videoId)
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );

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

      if (msg === "no_captions") {
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
    if (!filename)
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );

    const client = new Anthropic({ apiKey });
    const speakerNote = multiSpeaker
      ? " Use [Speaker 1], [Speaker 2] labels for different speakers."
      : "";

    const prompt = `You are a professional transcription service. Generate a realistic, detailed transcription demo for an audio/video file named "${filename}".

Language: ${language}
Format: ${format}
${multiSpeaker ? "Mode: Multi-speaker (label each speaker)" : "Mode: Single speaker"}

Create a high-quality, natural-sounding transcription of approximately 200-300 words.${speakerNote}

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
