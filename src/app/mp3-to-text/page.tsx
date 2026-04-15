import type { Metadata } from "next";
import FileToolPage from "@/components/tools/FileToolPage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "MP3 to Text Converter — Free AI Transcription",
  description: "Convert MP3 files to text online for free. AI-powered transcription with 99.8% accuracy, 50+ languages, speaker detection.",
  alternates: { canonical: `${siteUrl}/mp3-to-text` },
  openGraph: {
    url: `${siteUrl}/mp3-to-text`,
    title: "MP3 to Text Converter — Free AI Transcription | TranscribeX",
  },
};

const tool = {
  id: "mp3-to-text",
  slug: "mp3-to-text",
  title: "MP3 to Text Converter",
  shortTitle: "MP3 to Text",
  description: "Convert MP3 audio files to accurate text transcripts in seconds. Free AI-powered MP3 transcription with speaker detection.",
  metaTitle: "MP3 to Text Converter — Free AI Transcription | TranscribeX",
  metaDescription: "Convert MP3 files to text online for free.",
  iconName: "MusicNote",
  acceptedFormats: ["MP3"],
  relatedTools: [],
};

const relatedTools = [
  { href: "/audio-to-text-converter", label: "Audio to Text" },
  { href: "/wav-to-text", label: "WAV to Text" },
  { href: "/m4a-to-text", label: "M4A to Text" },
  { href: "/flac-to-text", label: "FLAC to Text" },
];

const steps = [
  { title: "Upload MP3 file", desc: "Drag and drop your MP3 audio file or click to browse." },
  { title: "Select language", desc: "Choose from 50+ languages and optionally enable speaker detection." },
  { title: "Download transcript", desc: "Get your MP3 transcribed to text and export as TXT or SRT." },
];

const whyPoints = [
  "Purpose-built for MP3 transcription with 99.8% AI accuracy",
  "Handles podcasts, interviews, voice memos, and music",
  "Automatic speaker labeling for multi-person recordings",
  "50+ language support including major world languages",
  "SRT export for video captions and subtitles",
  "No file quality requirement — works with compressed MP3s",
  "Secure processing, files deleted after transcription",
  "Completely free, no account required",
];

const faqs = [
  { question: "How do I convert an MP3 to text?", answer: "Upload your MP3 file by dragging it onto the upload zone or clicking to browse. Select your language, then click Transcribe Now. Your transcript is ready in seconds." },
  { question: "What's the maximum MP3 file size?", answer: "You can upload MP3 files up to 500 MB in size. For very long recordings, consider splitting the file into chapters for faster processing." },
  { question: "Can it transcribe podcast MP3 files?", answer: "Yes! TranscribeX works great for podcasts. Enable the multi-speaker option to get labeled transcripts for each host and guest." },
  { question: "Does audio quality affect transcription accuracy?", answer: "Higher quality recordings produce better transcripts. Clear audio with minimal background noise achieves 99.8% accuracy." },
  { question: "Can I get SRT subtitles from an MP3?", answer: "Yes. After transcribing, download the SRT file with automatic timestamps — useful for creating video captions." },
];

export default function Mp3ToTextPage() {
  return <FileToolPage tool={tool} relatedTools={relatedTools} steps={steps} whyPoints={whyPoints} faqs={faqs} />;
}
