import type { Metadata } from "next";
import FileToolPage from "@/components/tools/FileToolPage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "MP4 to Text Converter — Free Video Transcription",
  description: "Convert MP4 video to text online for free. AI transcription with speaker detection, 50+ languages, SRT subtitle export.",
  alternates: { canonical: `${siteUrl}/mp4-to-text` },
  openGraph: {
    url: `${siteUrl}/mp4-to-text`,
    title: "MP4 to Text Converter — Free Video Transcription | TranscribeX",
  },
};

const tool = {
  id: "mp4-to-text",
  slug: "mp4-to-text",
  title: "MP4 to Text Converter",
  shortTitle: "MP4 to Text",
  description: "Transcribe MP4 video files to text with AI precision. Export as TXT or SRT subtitles in 50+ languages.",
  metaTitle: "MP4 to Text Converter — Free Video Transcription | TranscribeX",
  metaDescription: "Convert MP4 video to text online for free.",
  iconName: "VideoCamera",
  acceptedFormats: ["MP4"],
  relatedTools: [],
};

const relatedTools = [
  { href: "/video-to-text-converter", label: "Video to Text" },
  { href: "/youtube-to-text", label: "YouTube to Text" },
  { href: "/mp3-to-text", label: "MP3 to Text" },
  { href: "/youtube-to-mp4", label: "YouTube to MP4" },
];

const steps = [
  { title: "Upload MP4 video", desc: "Drag and drop your MP4 file onto the upload area or click to select." },
  { title: "Choose language & settings", desc: "Select language and enable speaker detection for interviews or presentations." },
  { title: "Get text transcript", desc: "AI transcribes your MP4 audio track. Download as TXT or SRT." },
];

const whyPoints = [
  "Fast MP4 transcription — most videos done in under 60 seconds",
  "Extracts and transcribes the full audio track from your video",
  "Speaker detection perfect for interviews and webinars",
  "Generate YouTube-ready SRT subtitle files",
  "50+ language support with accent handling",
  "Works with any MP4 — screen recordings, meetings, tutorials",
  "No permanent storage — files deleted after processing",
  "Free, no registration required",
];

const faqs = [
  { question: "How do I transcribe an MP4 video?", answer: "Upload your MP4 file, choose your language, and click Transcribe. The AI extracts the audio track and converts it to text in seconds." },
  { question: "Can I use this to create YouTube subtitles?", answer: "Yes! After transcription, download the SRT file and upload it directly to YouTube in Video Manager under the Subtitles section." },
  { question: "What if my MP4 has multiple people speaking?", answer: "Enable 'Multiple speakers' before transcribing. The AI will label each speaker's lines automatically." },
  { question: "Is there a limit on MP4 video length?", answer: "The maximum file size is 500 MB. This covers most videos up to about 30–60 minutes in standard quality." },
  { question: "Does it work with screen recordings?", answer: "Yes. As long as the video has clear audio, TranscribeX will accurately transcribe it — tutorials, presentations, Zoom recordings, all work great." },
];

export default function Mp4ToTextPage() {
  return <FileToolPage tool={tool} relatedTools={relatedTools} steps={steps} whyPoints={whyPoints} faqs={faqs} />;
}
