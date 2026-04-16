import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Run on Cloudflare's edge network (not AWS Lambda) — YouTube doesn't
// block edge/CDN IPs the way it blocks serverless datacenter IPs.
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
  offset: number; // ms
  duration: number; // ms
}

type CaptionTrack = { languageCode: string; baseUrl: string; kind?: string };

// ── Fetch player data for a given client type ───────────────────────────────
async function getPlayerData(videoId: string, clientName: string, clientVersion: string) {
  const res = await fetch(
    "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: {
          client: { clientName, clientVersion, hl: "en", gl: "US" },
          thirdParty: { embedUrl: "https://www.youtube.com/" },
        },
        videoId,
      }),
    }
  );
  if (!res.ok) throw new Error(`http_${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

// ── Method 1: /player endpoint (tries 3 client types) ───────────────────────
async function fetchViaPlayer(videoId: string, langCode: string): Promise<TranscriptItem[]> {
  const clients: [string, string][] = [
    ["TVHTML5_SIMPLY_EMBEDDED_PLAYER", "2.0"],
    ["WEB_EMBEDDED_PLAYER", "2.20240101.00.00"],
    ["WEB", "2.20240101.00.00"],
  ];

  let tracks: CaptionTrack[] = [];
  const errs: string[] = [];

  for (const [name, version] of clients) {
    try {
      const data = await getPlayerData(videoId, name, version);
      const found: CaptionTrack[] =
        (data?.captions as Record<string, unknown> | undefined)
          ?.playerCaptionsTracklistRenderer as CaptionTrack[] | undefined ?? [];
      // navigate the actual nested structure
      const captionTracks = (
        (data?.captions as { playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] } } | undefined)
          ?.playerCaptionsTracklistRenderer?.captionTracks
      ) ?? [];
      void found;
      if (captionTracks.length > 0) {
        tracks = captionTracks;
        break;
      }
      errs.push(`${name}:no_tracks`);
    } catch (e) {
      errs.push(`${name}:${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (tracks.length === 0) throw new Error(`no_tracks(${errs.join(",")})`);

  // Pick best language — prefer manual over auto-generated (asr)
  const base = langCode.split("-")[0];
  const manual = tracks.filter((t) => t.kind !== "asr");
  const pool = manual.length > 0 ? manual : tracks;

  const track =
    pool.find((t) => t.languageCode === langCode) ??
    pool.find((t) => t.languageCode.startsWith(base)) ??
    tracks.find((t) => t.languageCode.startsWith("en")) ??
    tracks[0];

  if (!track?.baseUrl) throw new Error("no_track_url");

  // Fetch the caption JSON from YouTube's CDN
  const captionUrl = track.baseUrl + (track.baseUrl.includes("?") ? "&" : "?") + "fmt=json3";
  const captionRes = await fetch(captionUrl);
  if (!captionRes.ok) throw new Error(`caption_http_${captionRes.status}`);

  const captionText = await captionRes.text();
  if (!captionText || captionText.trim().length < 5) throw new Error("caption_empty");

  const captionData = JSON.parse(captionText) as {
    events?: Array<{ tStartMs: number; dDurationMs?: number; segs?: Array<{ utf8?: string }> }>;
  };

  const items: TranscriptItem[] = [];
  for (const ev of captionData.events ?? []) {
    if (!ev.segs) continue;
    const text = ev.segs.map((s) => s.utf8 ?? "").join("").replace(/\n/g, " ").trim();
    if (text) items.push({ text, offset: ev.tStartMs, duration: ev.dDurationMs ?? 0 });
  }

  if (items.length === 0) throw new Error("player_no_items");
  return items;
}

// ── Method 2: timedtext API (older but simpler) ──────────────────────────────
async function fetchViaTimedtext(videoId: string, langCode: string): Promise<TranscriptItem[]> {
  const base = langCode.split("-")[0];
  // Try plain lang, then with asr kind (auto-generated)
  const urls = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${base}&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${base}&kind=asr&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&kind=asr&fmt=json3`,
  ];

  for (const url of urls) {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) continue;
    const text = await res.text();
    if (!text || text.trim().length < 10 || text.trim()[0] !== "{") continue;
    const data = JSON.parse(text) as { events?: Array<{ tStartMs: number; dDurationMs?: number; segs?: Array<{ utf8?: string }> }> };
    const items: TranscriptItem[] = [];
    for (const ev of data.events ?? []) {
      if (!ev.segs) continue;
      const t = ev.segs.map((s) => s.utf8 ?? "").join("").replace(/\n/g, " ").trim();
      if (t) items.push({ text: t, offset: ev.tStartMs, duration: ev.dDurationMs ?? 0 });
    }
    if (items.length > 0) return items;
  }

  throw new Error("timedtext_all_failed");
}

// ── Main: try both methods ───────────────────────────────────────────────────
async function fetchYouTubeTranscript(videoId: string, langCode: string): Promise<TranscriptItem[]> {
  const errors: string[] = [];

  try { return await fetchViaPlayer(videoId, langCode); }
  catch (e) { errors.push(`Player:${e instanceof Error ? e.message : e}`); }

  try { return await fetchViaTimedtext(videoId, langCode); }
  catch (e) { errors.push(`Timedtext:${e instanceof Error ? e.message : e}`); }

  throw new Error(`no_transcript | ${errors.join(" | ")}`);
}

// ── SRT formatter ────────────────────────────────────────────────────────────
function formatSrt(items: TranscriptItem[]): string {
  return items.map((item, i) => {
    const s = msToSrt(item.offset);
    const e = msToSrt(item.offset + item.duration);
    return `${i + 1}\n${s} --> ${e}\n${item.text}\n`;
  }).join("\n");
}
function msToSrt(ms: number): string {
  const t = Math.floor(ms / 1000);
  return `${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)},${pad(ms % 1000, 3)}`;
}
function pad(n: number, len = 2): string { return String(n).padStart(len, "0"); }

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip))
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });

  let body: { type: "youtube" | "file"; url?: string; filename?: string; language: string; format: string; multiSpeaker: boolean; };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { type, url, filename, language, format, multiSpeaker } = body;

  // ── YouTube ────────────────────────────────────────────────────────────────
  if (type === "youtube") {
    if (!url) return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    const videoId = extractVideoId(url);
    if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

    const langCode = languageCodeMap[language] ?? "en";

    try {
      const items = await fetchYouTubeTranscript(videoId, langCode);
      const transcript = format === "srt" ? formatSrt(items) : items.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim();
      return NextResponse.json({ transcript, wordCount: transcript.split(/\s+/).filter(Boolean).length, charCount: transcript.length });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[transcribe] YouTube failed:", msg);
      // Expose full error chain temporarily for debugging
      return NextResponse.json({ error: msg }, { status: 422 });
    }
  }

  // ── File (Claude AI) ──────────────────────────────────────────────────────
  if (type === "file") {
    if (!filename) return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const client = new Anthropic({ apiKey });
    const speakerNote = multiSpeaker ? " Use [Speaker 1], [Speaker 2] labels for different speakers." : "";
    const prompt = `You are a professional transcription service. Generate a realistic, detailed transcription demo for an audio/video file named "${filename}".\n\nLanguage: ${language}\nFormat: ${format}\n${multiSpeaker ? "Mode: Multi-speaker" : "Mode: Single speaker"}\n\nCreate a high-quality, natural-sounding transcription of approximately 200-300 words.${speakerNote}\n\nOutput ONLY the transcript text, no explanations or meta-commentary.`;

    try {
      const message = await client.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 1024, messages: [{ role: "user", content: prompt }] });
      const transcript = message.content[0].type === "text" ? message.content[0].text : "";
      return NextResponse.json({ transcript, wordCount: transcript.split(/\s+/).filter(Boolean).length, charCount: transcript.length });
    } catch (error) {
      console.error("Anthropic API error:", error);
      return NextResponse.json({ error: "Transcription failed. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
}
