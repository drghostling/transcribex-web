import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const languageCodeMap: Record<string, string> = {
  English: "en", Spanish: "es", French: "fr", German: "de",
  Portuguese: "pt", Italian: "it", Japanese: "ja", Korean: "ko",
  "Chinese (Simplified)": "zh", Arabic: "ar", Turkish: "tr",
  Russian: "ru", Dutch: "nl", Polish: "pl", Swedish: "sv",
  Hindi: "hi", Bengali: "bn", Norwegian: "no", Danish: "da",
  Finnish: "fi", Greek: "el", Czech: "cs", Romanian: "ro",
  Hungarian: "hu", Ukrainian: "uk", Thai: "th", Vietnamese: "vi",
  Indonesian: "id", Malay: "ms",
};

async function uploadFile(buffer: ArrayBuffer, apiKey: string): Promise<string> {
  const res = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`upload_failed_${res.status}`);
  const data = await res.json() as { upload_url: string };
  return data.upload_url;
}

async function submitJob(
  audioUrl: string,
  langCode: string,
  speakerLabels: boolean,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: { Authorization: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ audio_url: audioUrl, language_code: langCode, speaker_labels: speakerLabels }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`submit_failed_${res.status}(${body.slice(0, 200)})`);
  }
  const data = await res.json() as { id: string };
  return data.id;
}

async function pollUntilDone(id: string, apiKey: string) {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { Authorization: apiKey },
    });
    if (!res.ok) throw new Error(`poll_failed_${res.status}`);
    const data = await res.json() as {
      status: string;
      text?: string;
      error?: string;
      utterances?: { speaker: string; text: string }[];
    };
    if (data.status === "completed") return data;
    if (data.status === "error") throw new Error(`assemblyai_error: ${data.error}`);
  }
  throw new Error("transcription_timeout");
}

async function fetchSrt(id: string, apiKey: string): Promise<string> {
  const res = await fetch(`https://api.assemblyai.com/v2/transcript/${id}/srt`, {
    headers: { Authorization: apiKey },
  });
  if (!res.ok) throw new Error(`srt_failed_${res.status}`);
  return res.text();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Transcription service not configured" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const language = (formData.get("language") as string) ?? "English";
  const format = (formData.get("format") as string) ?? "txt";
  const multiSpeaker = formData.get("multiSpeaker") === "true";
  const langCode = languageCodeMap[language] ?? "en";

  try {
    const buffer = await file.arrayBuffer();
    const uploadUrl = await uploadFile(buffer, apiKey);
    const jobId = await submitJob(uploadUrl, langCode, multiSpeaker, apiKey);
    const result = await pollUntilDone(jobId, apiKey);

    let transcript: string;
    if (format === "srt") {
      transcript = await fetchSrt(jobId, apiKey);
    } else if (multiSpeaker && result.utterances?.length) {
      transcript = result.utterances
        .map((u) => `[Speaker ${u.speaker}]: ${u.text}`)
        .join("\n\n");
    } else {
      transcript = result.text ?? "";
    }

    return NextResponse.json({
      transcript,
      wordCount: transcript.split(/\s+/).filter(Boolean).length,
      charCount: transcript.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[transcribe-file] failed:", msg);
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
