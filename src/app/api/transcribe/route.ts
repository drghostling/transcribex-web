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

type CaptionTrack = {
  languageCode: string;
  baseUrl: string;
  kind?: string;
  name?: { simpleText?: string };
};

// ── Step 1: Fetch the YouTube watch page ─────────────────────────────────────
// We use the SOCS cookie to bypass GDPR consent and gl/hl params to ensure
// an English, US response with full player data.
async function fetchWatchPage(videoId: string): Promise<string> {
  const res = await fetch(
    `https://www.youtube.com/watch?v=${videoId}&hl=en&gl=US`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        // SOCS bypasses the GDPR consent redirect on YouTube
        "Cookie": "SOCS=CAISHAgCEhIaAB; CONSENT=YES+cb",
      },
    }
  );

  if (!res.ok) throw new Error(`watch_page_${res.status}`);

  const html = await res.text();

  // A real consent/sign-in redirect is tiny; the watch page is always >> 50 KB
  if (html.length < 50_000) {
    throw new Error(`watch_page_too_short(len=${html.length})`);
  }

  return html;
}

// ── Step 2: Extract ytInitialPlayerResponse from HTML ───────────────────────
// YouTube embeds the full player data as a JS variable. We extract it with
// bracket counting so we get the complete JSON regardless of size.
function extractPlayerResponse(html: string): Record<string, unknown> {
  const marker = "ytInitialPlayerResponse =";
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) throw new Error("no_ytInitialPlayerResponse_marker");

  const jsonStart = html.indexOf("{", markerIdx + marker.length);
  if (jsonStart === -1) throw new Error("no_json_start");

  // Walk forward counting braces to find the matching close
  let depth = 0;
  let i = jsonStart;
  for (; i < Math.min(html.length, jsonStart + 3_000_000); i++) {
    if (html[i] === "{") depth++;
    else if (html[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }

  if (depth !== 0) throw new Error("json_brace_mismatch");

  const jsonStr = html.substring(jsonStart, i + 1);

  let playerResponse: Record<string, unknown>;
  try {
    playerResponse = JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    throw new Error("json_parse_failed");
  }

  return playerResponse;
}

// ── Step 3: Pull captionTracks from player response ──────────────────────────
function getCaptionTracks(playerResponse: Record<string, unknown>): CaptionTrack[] {
  type Captions = {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrack[];
    };
  };

  const captions = playerResponse.captions as Captions | undefined;
  const tracks = captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

  if (tracks.length === 0) {
    // Debug: surface what the captions key looks like
    const preview = JSON.stringify(playerResponse.captions)?.slice(0, 200) ?? "undefined";
    throw new Error(`no_caption_tracks(captions=${preview})`);
  }

  return tracks;
}

// ── Step 4: Pick the best language track ─────────────────────────────────────
function pickTrack(tracks: CaptionTrack[], langCode: string): CaptionTrack {
  const base = langCode.split("-")[0];
  // Prefer manually uploaded captions over auto-generated (kind: "asr")
  const manual = tracks.filter((t) => t.kind !== "asr");
  const pool = manual.length > 0 ? manual : tracks;

  return (
    pool.find((t) => t.languageCode === langCode) ??
    pool.find((t) => t.languageCode.startsWith(base)) ??
    tracks.find((t) => t.languageCode.startsWith("en")) ??
    tracks[0]
  );
}

// ── Step 5: Fetch and parse the caption JSON ─────────────────────────────────
async function fetchCaptionItems(track: CaptionTrack): Promise<TranscriptItem[]> {
  if (!track?.baseUrl) throw new Error("no_baseUrl");

  const sep = track.baseUrl.includes("?") ? "&" : "?";
  const url = `${track.baseUrl}${sep}fmt=json3`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`caption_fetch_${res.status}`);

  const text = await res.text();
  if (!text || text.length < 10) throw new Error("caption_response_empty");

  type CaptionEvent = {
    tStartMs: number;
    dDurationMs?: number;
    segs?: Array<{ utf8?: string }>;
  };
  const data = JSON.parse(text) as { events?: CaptionEvent[] };
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

  if (items.length === 0) throw new Error("caption_events_empty");
  return items;
}

// ── Main transcript fetcher ──────────────────────────────────────────────────
async function fetchYouTubeTranscript(videoId: string, langCode: string): Promise<TranscriptItem[]> {
  const html = await fetchWatchPage(videoId);
  const playerResponse = extractPlayerResponse(html);
  const tracks = getCaptionTracks(playerResponse);
  const track = pickTrack(tracks, langCode);
  return fetchCaptionItems(track);
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
      // Expose error for debugging until stable
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
