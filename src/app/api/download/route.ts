import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const qualityMap: Record<string, string> = {
  "4K (2160p)": "2160",
  "1080p HD": "1080",
  "1080p": "1080",
  "720p HD": "720",
  "720p": "720",
  "480p SD": "480",
  "480p": "480",
  "360p": "360",
  "240p": "240",
};

const audioFormatMap: Record<string, string> = {
  mp3: "mp3",
  ogg: "ogg",
  m4a: "best",
  wav: "wav",
  opus: "opus",
};

export async function POST(req: NextRequest) {
  let body: { url: string; format: string; quality?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { url, format, quality } = body;
  if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  const audioOnly = ["mp3", "m4a", "ogg", "wav", "opus"].includes(format);

  const cobaltPayload = {
    url,
    videoQuality: qualityMap[quality ?? "1080p HD"] ?? "1080",
    audioFormat: audioFormatMap[format] ?? "best",
    downloadMode: audioOnly ? "audio" : "auto",
    filenameStyle: "basic",
  };

  type CobaltResponse = { status: string; url?: string; error?: { code?: string }; picker?: { url: string }[] }
  let data: CobaltResponse;
  try {
    const headers: Record<string, string> = {
      "Accept": "application/json",
      "Content-Type": "application/json",
    };
    const cobaltKey = process.env.COBALT_API_KEY;
    if (cobaltKey) headers["Authorization"] = `Api-Key ${cobaltKey}`;

    const res = await fetch("https://api.cobalt.tools/", {
      method: "POST",
      headers,
      body: JSON.stringify(cobaltPayload),
    });
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "Download service unreachable" }, { status: 502 });
  }

  if (data.status === "redirect" || data.status === "stream" || data.status === "tunnel") {
    return NextResponse.json({ downloadUrl: data.url });
  }

  if (data.status === "picker" && Array.isArray(data.picker)) {
    return NextResponse.json({ downloadUrl: data.picker[0]?.url });
  }

  const code = data.error?.code ?? data.status ?? "unknown";
  return NextResponse.json({ error: `Download failed: ${code}` }, { status: 422 });
}
