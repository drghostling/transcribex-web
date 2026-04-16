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

// ── Method 1: YouTube /player endpoint → caption track URL → fetch XML ───────
async function fetchViaPlayer(videoId: string, langCode: string): Promise<TranscriptItem[]> {
  // Step 1: Get video player data (includes captionTracks with baseUrls)
  const playerRes = await fetch(
    "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "X-YouTube-Client-Name": "1",
        "X-YouTube-Client-Version": "2.20240101.00.00",
        "Origin": "https://www.youtube.com",
        "Referer": `https://www.youtube.com/watch?v=${videoId}`,
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00",
            hl: "en",
            gl: "US",
          },
        },
        videoId,
      }),
    }
  );

  if (!playerRes.ok) {
    const txt = await playerRes.text();
    throw new Error(`player_${playerRes.status}: ${txt.slice(0, 150)}`);
  }

  const playerData = await playerRes.json();
  const tracks: Array<{ languageCode: string; baseUrl: string; kind?: string }> =
    playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

  if (tracks.length === 0) throw new Error("player_no_tracks");

  // Step 2: Pick best language (prefer manual over auto-generated)
  const base = langCode.split("-")[0];
  const manual = tracks.filter((t) => t.kind !== "asr");
  const auto = tracks.filter((t) => t.kind === "asr");
  const pool = manual.length > 0 ? manual : auto;

  const track =
    pool.find((t) => t.languageCode === langCode) ??
    pool.find((t) => t.languageCode.startsWith(base)) ??
    tracks.find((t) => t.languageCode.startsWith("en")) ??
    tracks[0];

  if (!track?.baseUrl) throw new Error("player_no_track_url");

  // Step 3: Fetch caption JSON (append &fmt=json3 to baseUrl)
  const sep = track.baseUrl.includes("?") ? "&" : "?";
  const captionRes = await fetch(`${track.baseUrl}${sep}fmt=json3`);
  if (!captionRes.ok) throw new Error(`caption_${captionRes.status}`);

  const captionText = await captionRes.text();
  if (!captionText || captionText.trim().length < 5) throw new Error("caption_empty");

  const captionData: {
    events?: Array<{ tStartMs: number; dDurationMs?: number; segs?: Array<{ utf8?: string }> }>;
  } = JSON.parse(captionText);

  const items: TranscriptItem[] = [];
  for (const ev of captionData.events ?? []) {
    if (!ev.segs) continue;
    const text = ev.segs.map((s) => s.utf8 ?? "").join("").replace(/\n/g, " ").trim();
    if (text) items.push({ text, offset: ev.tStartMs, duration: ev.dDurationMs ?? 0 });
  }

  if (items.length === 0) throw new Error("player_no_items");
  return items;
}

// ── Method 2: YouTube timedtext API ─────────────────────────────────────────
async function fetchViaTimedtext(videoId: string, langCode: string): Promise<TranscriptItem[]> {
  const base = langCode.split("-")[0];
  const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${base}&fmt=json3&xorb=2&xobt=3&xovt=3`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": "https://www.youtube.com/",
    },
  });

  if (!res.ok) throw new Error(`timedtext_${res.status}`);

  const text = await res.text();
  if (!text || text.trim().length < 5) throw new Error("timedtext_empty");

  let data: { events?: Array<{ tStartMs: number; dDurationMs?: number; segs?: Array<{ utf8?: string }> }> };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("timedtext_parse");
  }

  const events = data.events ?? [];
  const items: TranscriptItem[] = [];
  for (const ev of events) {
    if (!ev.segs) continue;
    const txt = ev.segs.map((s) => s.utf8 ?? "").join("").replace(/\n/g, " ").trim();
    if (txt) items.push({ text: txt, offset: ev.tStartMs, duration: ev.dDurationMs ?? 0 });
  }

  if (items.length === 0) throw new Error("timedtext_no_items");
  return items;
}

// ── Main: try both methods ──────────────────────────────────────────────────
async function fetchYouTubeTranscript(videoId: string, langCode: string): Promise<TranscriptItem[]> {
  const errors: string[] = [];

  try {
    return await fetchViaPlayer(videoId, langCode);
  } catch (e) {
    errors.push(`Player: ${e instanceof Error ? e.message : e}`);
  }

  try {
    return await fetchViaTimedtext(videoId, langCode);
  } catch (e) {
    errors.push(`Timedtext: ${e instanceof Error ? e.message : e}`);
  }

  // Fallback: try English if a different language was requested
  if (langCode !== "en") {
    try {
      return await fetchViaTimedtext(videoId, "en");
    } catch (e) {
      errors.push(`Timedtext-en: ${e instanceof Error ? e.message : e}`);
    }
  }

  throw new Error(`no_transcript | ${errors.join(" | ")}`);
}

// ── SRT formatter ───────────────────────────────────────────────────────────
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

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

// ── Route handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
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
    if (!url) return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });

    const videoId = extractVideoId(url);
    if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

    const langCode = languageCodeMap[language] ?? "en";

    try {
      const items = await fetchYouTubeTranscript(videoId, langCode);

      const transcript = format === "srt"
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

      // Temporary debug: show full error chain so we can diagnose
      return NextResponse.json(
        { error: msg },
        { status: 422 }
      );
    }
  }

  // ── File (Claude AI) ─────────────────────────────────────────────────────
  if (type === "file") {
    if (!filename) return NextResponse.json({ error: "Filename is required" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const client = new Anthropic({ apiKey });
    const speakerNote = multiSpeaker ? " Use [Speaker 1], [Speaker 2] labels for different speakers." : "";

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

      const transcript = message.content[0].type === "text" ? message.content[0].text : "";

      return NextResponse.json({
        transcript,
        wordCount: transcript.split(/\s+/).filter(Boolean).length,
        charCount: transcript.length,
      });
    } catch (error) {
      console.error("Anthropic API error:", error);
      return NextResponse.json({ error: "Transcription failed. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
}
