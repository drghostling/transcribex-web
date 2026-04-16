import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

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
  offset: number;
  duration: number;
}

// ── Supadata transcript fetcher ──────────────────────────────────────────────
async function fetchYouTubeTranscript(
  videoId: string,
  langCode: string,
  apiKey: string
): Promise<TranscriptItem[]> {
  const params = new URLSearchParams({
    url: `https://www.youtube.com/watch?v=${videoId}`,
    lang: langCode,
    text: "false",
  });

  const res = await fetch(
    `https://api.supadata.ai/v1/transcript?${params.toString()}`,
    { headers: { "x-api-key": apiKey } }
  );

  if (res.status === 401) throw new Error("supadata_invalid_api_key");
  if (res.status === 404) throw new Error("supadata_video_not_found_or_no_captions");
  if (res.status === 429) throw new Error("supadata_rate_limit_exceeded");
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`supadata_${res.status}(${body.slice(0, 300)})`);
  }

  type SupadataSegment = { text: string; offset: number; duration: number; lang?: string };
  const data = await res.json() as {
    content: SupadataSegment[];
    lang?: string;
    availableLangs?: string[];
  };

  if (!Array.isArray(data.content) || data.content.length === 0) {
    throw new Error("supadata_empty_transcript");
  }

  return data.content.map((s) => ({
    text: s.text,
    offset: s.offset,
    duration: s.duration,
  }));
}

// ── SRT helpers ──────────────────────────────────────────────────────────────
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

// ── Route handler ────────────────────────────────────────────────────────────
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

    const apiKey = process.env.SUPADATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Transcription service not configured" }, { status: 500 });
    }

    const langCode = languageCodeMap[language] ?? "en";

    try {
      const items = await fetchYouTubeTranscript(videoId, langCode, apiKey);
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
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[transcribe] YouTube failed:", msg);
      return NextResponse.json({ error: msg }, { status: 422 });
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
    const prompt = `You are a professional transcription service. Generate a realistic, detailed transcription demo for an audio/video file named "${filename}".\n\nLanguage: ${language}\nFormat: ${format}\n${multiSpeaker ? "Mode: Multi-speaker" : "Mode: Single speaker"}\n\nCreate a high-quality, natural-sounding transcription of approximately 200-300 words.${speakerNote}\n\nOutput ONLY the transcript text, no explanations or meta-commentary.`;

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
