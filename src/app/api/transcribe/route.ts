import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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

  if (type === "youtube" && !url) {
    return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
  }

  if (type === "file" && !filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });

  const source = type === "youtube" ? `YouTube video at ${url}` : `audio/video file "${filename}"`;
  const speakerNote = multiSpeaker ? " Use [Speaker 1], [Speaker 2] labels for different speakers." : "";

  const prompt = `You are a professional transcription service. Generate a realistic, detailed transcription demo for a ${source}.

Language: ${language}
Format: ${format}
${multiSpeaker ? "Mode: Multi-speaker (label each speaker)" : "Mode: Single speaker"}

Create a high-quality, natural-sounding transcription of approximately 200-300 words that feels like a real transcript of this content.${speakerNote}

If it's a YouTube video URL, infer what kind of content it might be from the URL and generate an appropriate transcript.

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
