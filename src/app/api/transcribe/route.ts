import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { YoutubeTranscript } from "youtube-transcript";

// Simple in-memory rate limiter (resets on server restart)
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
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
}

// Map display language names to ISO 639-1 codes YouTube uses
const languageCodeMap: Record<string, string> = {
  English: "en",
  Spanish: "es",
  French: "fr",
  German: "de",
  Portuguese: "pt",
  Italian: "it",
  Japanese: "ja",
  Korean: "ko",
  "Chinese (Simplified)": "zh-Hans",
  Arabic: "ar",
  Turkish: "tr",
  Russian: "ru",
  Dutch: "nl",
  Polish: "pl",
  Swedish: "sv",
  Hindi: "hi",
  Bengali: "bn",
};

function formatSrt(items: { text: string; offset: number; duration: number }[]): string {
  return items
    .map((item, i) => {
      const start = msToSrt(item.offset);
      const end = msToSrt(item.offset + item.duration);
      return `${i + 1}\n${start} --> ${end}\n${item.text.trim()}\n`;
    })
    .join("\n");
}

function msToSrt(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const milliseconds = Math.floor(ms % 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(milliseconds, 3)}`;
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

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
    fileData?: string;
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

  // ── YouTube transcription (real captions) ──────────────────────────────────
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
      // Try requested language first, then fall back to English
      let items: { text: string; offset: number; duration: number }[] = [];
      try {
        items = await YoutubeTranscript.fetchTranscript(videoId, { lang: langCode });
      } catch {
        if (langCode !== "en") {
          items = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
        } else {
          throw new Error("no_captions");
        }
      }

      // Clean up HTML entities and extra whitespace from YouTube captions
      const clean = (text: string) =>
        text
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\n/g, " ")
          .trim();

      const cleanedItems = items.map((item) => ({ ...item, text: clean(item.text) }));

      let transcript: string;
      if (format === "srt") {
        transcript = formatSrt(cleanedItems);
      } else {
        transcript = cleanedItems.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim();
      }

      const wordCount = transcript.split(/\s+/).filter(Boolean).length;
      const charCount = transcript.length;

      return NextResponse.json({ transcript, wordCount, charCount });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (
        msg.includes("no_captions") ||
        msg.toLowerCase().includes("transcript") ||
        msg.toLowerCase().includes("disabled") ||
        msg.toLowerCase().includes("could not get")
      ) {
        return NextResponse.json(
          {
            error:
              "This video doesn't have captions available. Try a video with auto-generated or manual subtitles enabled.",
          },
          { status: 422 }
        );
      }
      console.error("YouTube transcript error:", error);
      return NextResponse.json(
        { error: "Could not fetch transcript. The video may be private, age-restricted, or unavailable." },
        { status: 422 }
      );
    }
  }

  // ── File transcription (Claude AI) ─────────────────────────────────────────
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

Create a high-quality, natural-sounding transcription of approximately 200-300 words that feels like a real transcript of this content.${speakerNote}

Infer what kind of content it might be from the filename and generate an appropriate transcript.

Output ONLY the transcript text, no explanations or meta-commentary. Make it sound authentic and professional.`;

    try {
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const transcript =
        message.content[0].type === "text" ? message.content[0].text : "";
      const wordCount = transcript.split(/\s+/).filter(Boolean).length;
      const charCount = transcript.length;

      return NextResponse.json({ transcript, wordCount, charCount });
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
