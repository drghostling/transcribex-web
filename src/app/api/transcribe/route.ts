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

type TimedTextTrack = {
  langCode: string;
  name: string;
  kind: string; // "asr" = auto-generated
};

const YT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

// ── Step 1: Get available caption tracks via timedtext list API ──────────────
// This endpoint powers YouTube's embedded player on third-party sites and is
// therefore accessible from server/datacenter IPs, unlike ytInitialPlayerResponse.
async function getTimedTextTracks(videoId: string): Promise<TimedTextTrack[]> {
  const url = `https://www.youtube.com/api/timedtext?v=${encodeURIComponent(videoId)}&type=list`;
  const res = await fetch(url, { headers: YT_HEADERS });

  if (!res.ok) throw new Error(`timedtext_list_${res.status}`);

  const xml = await res.text();
  if (!xml || xml.length < 10) throw new Error("timedtext_list_empty");

  // Parse <track ... lang_code="en" name="" kind="asr" ... />
  const tracks: TimedTextTrack[] = [];
  const tagRe = /<track[^>]+>/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(xml)) !== null) {
    const tag = m[0];
    const langCode = tag.match(/lang_code="([^"]+)"/)?.[1] ?? "";
    const name = tag.match(/\bname="([^"]*)"/)?.[1] ?? "";
    const kind = tag.match(/\bkind="([^"]*)"/)?.[1] ?? "";
    if (langCode) tracks.push({ langCode, name, kind });
  }

  if (tracks.length === 0) {
    throw new Error(`timedtext_no_tracks(xml=${xml.slice(0, 300)})`);
  }

  return tracks;
}

// ── Step 2: Pick the best matching track ────────────────────────────────────
function pickTimedTextTrack(tracks: TimedTextTrack[], langCode: string): TimedTextTrack {
  const base = langCode.split("-")[0];
  // Prefer manually uploaded captions over auto-generated
  const manual = tracks.filter((t) => t.kind !== "asr");
  const pool = manual.length > 0 ? manual : tracks;

  return (
    pool.find((t) => t.langCode === langCode) ??
    pool.find((t) => t.langCode.startsWith(base)) ??
    tracks.find((t) => t.langCode.startsWith("en")) ??
    tracks[0]
  );
}

// ── Step 3: Fetch transcript JSON for the chosen track ──────────────────────
async function fetchTimedTextItems(videoId: string, track: TimedTextTrack): Promise<TranscriptItem[]> {
  const params = new URLSearchParams({ v: videoId, lang: track.langCode, fmt: "json3" });
  if (track.name) params.set("name", track.name);

  const url = `https://www.youtube.com/api/timedtext?${params.toString()}`;
  const res = await fetch(url, { headers: YT_HEADERS });

  if (!res.ok) throw new Error(`timedtext_fetch_${res.status}`);

  const text = await res.text();
  if (!text || text.length < 10) throw new Error("timedtext_response_empty");

  type CaptionEvent = {
    tStartMs: number;
    dDurationMs?: number;
    segs?: Array<{ utf8?: string }>;
  };

  let data: { events?: CaptionEvent[] };
  try {
    data = JSON.parse(text) as { events?: CaptionEvent[] };
  } catch {
    throw new Error("timedtext_json_parse_failed");
  }

  const items: TranscriptItem[] = [];
  for (const ev of data.events ?? []) {
    if (!ev.segs) continue;
    const txt = ev.segs
      .map((s) => s.utf8 ?? "")
      .join("")
      .replace(/\n/g, " ")
      .trim();
    if (txt) {
      items.push({ text: txt, offset: ev.tStartMs, duration: ev.dDurationMs ?? 0 });
    }
  }

  if (items.length === 0) throw new Error("timedtext_events_empty");
  return items;
}

// ── Main transcript fetcher ──────────────────────────────────────────────────
async function fetchYouTubeTranscript(videoId: string, langCode: string): Promise<TranscriptItem[]> {
  const tracks = await getTimedTextTracks(videoId);
  const track = pickTimedTextTrack(tracks, langCode);
  return fetchTimedTextItems(videoId, track);
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
