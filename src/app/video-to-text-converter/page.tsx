import type { Metadata } from "next";
import FileToolPage from "@/components/tools/FileToolPage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "Video to Text Converter — Free AI Video Transcription",
  description: "Convert video files to text transcripts with AI. Supports MP4, MOV, AVI, MKV and more. Get accurate captions and subtitles instantly.",
  alternates: { canonical: `${siteUrl}/video-to-text-converter` },
  openGraph: {
    url: `${siteUrl}/video-to-text-converter`,
    title: "Video to Text Converter — Free AI Video Transcription | TranscribeX",
  },
};

const tool = {
  id: "video-to-text",
  slug: "video-to-text-converter",
  title: "Video to Text Converter",
  shortTitle: "Video to Text",
  description: "Transcribe video files to text with speaker detection and subtitle export. Fast, accurate AI transcription for all video formats.",
  metaTitle: "Video to Text Converter — Free AI Video Transcription | TranscribeX",
  metaDescription: "Convert video files to text transcripts with AI.",
  iconName: "FilmStrip",
  acceptedFormats: ["MP4", "MOV", "AVI", "MKV", "WEBM", "FLV"],
  relatedTools: [],
};

const relatedTools = [
  { href: "/mp4-to-text", label: "MP4 to Text" },
  { href: "/youtube-to-text", label: "YouTube to Text" },
  { href: "/audio-to-text-converter", label: "Audio to Text" },
  { href: "/youtube-to-mp4", label: "YouTube to MP4" },
];

const steps = [
  { title: "Upload your video", desc: "Drag and drop any video file — MP4, MOV, AVI, MKV, WEBM, or FLV." },
  { title: "Configure options", desc: "Choose your language, enable speaker detection for multi-person content." },
  { title: "Download transcript", desc: "Get your full text transcript or SRT subtitle file in seconds." },
];

const whyPoints = [
  "Supports MP4, MOV, AVI, MKV, WEBM, FLV video formats",
  "Extract text from any video automatically",
  "Speaker detection for interviews and multi-person videos",
  "Export as SRT subtitles for YouTube, TikTok, or any editor",
  "50+ languages with AI-powered accuracy",
  "No registration, no watermarks, completely free",
  "Files are processed securely and never stored",
  "Works on any device — desktop, tablet, or mobile",
];

const faqs = [
  { question: "What video formats can I transcribe?", answer: "TranscribeX supports MP4, MOV, AVI, MKV, WEBM, and FLV video formats. Just upload your file and the AI extracts and transcribes the audio." },
  { question: "Can I get subtitles from my video?", answer: "Yes! After transcription, download an SRT subtitle file with automatic timestamps, ready for YouTube, TikTok, or any video editor." },
  { question: "How long does video transcription take?", answer: "Most videos are transcribed within 30–60 seconds depending on length. Longer videos may take a couple of minutes." },
  { question: "Does it work for foreign language videos?", answer: "Absolutely. Select your video's language from the dropdown (50+ supported) before transcribing for best accuracy." },
  { question: "Is the video file stored after transcription?", answer: "No. Your video is processed securely and immediately deleted after transcription. We never store your files or transcripts." },
];

export default function VideoToTextPage() {
  return <FileToolPage tool={tool} relatedTools={relatedTools} steps={steps} whyPoints={whyPoints} faqs={faqs} />;
}
