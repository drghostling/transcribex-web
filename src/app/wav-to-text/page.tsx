import type { Metadata } from "next";
import FileToolPage from "@/components/tools/FileToolPage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "WAV to Text Converter — Free AI Transcription",
  description: "Convert WAV files to text online for free. High-accuracy AI transcription for interviews, meetings, lectures and more.",
  alternates: { canonical: `${siteUrl}/wav-to-text` },
  openGraph: {
    url: `${siteUrl}/wav-to-text`,
    title: "WAV to Text Converter — Free AI Transcription | TranscribeX",
  },
};

const tool = {
  id: "wav-to-text",
  slug: "wav-to-text",
  title: "WAV to Text Converter",
  shortTitle: "WAV to Text",
  description: "Transcribe WAV audio files to text with high accuracy. Ideal for interviews, meetings, call recordings, and lectures.",
  metaTitle: "WAV to Text Converter — Free AI Transcription | TranscribeX",
  metaDescription: "Convert WAV files to text online for free.",
  iconName: "Equalizer",
  acceptedFormats: ["WAV"],
  relatedTools: [],
};

const relatedTools = [
  { href: "/audio-to-text-converter", label: "Audio to Text" },
  { href: "/mp3-to-text", label: "MP3 to Text" },
  { href: "/m4a-to-text", label: "M4A to Text" },
  { href: "/flac-to-text", label: "FLAC to Text" },
];

const steps = [
  { title: "Upload WAV file", desc: "Drag and drop your WAV audio file or click the upload area to browse." },
  { title: "Configure transcription", desc: "Select language and enable multi-speaker detection for group recordings." },
  { title: "Export your transcript", desc: "Download as TXT text or SRT subtitle file — free and instant." },
];

const whyPoints = [
  "WAV files deliver maximum audio quality for best accuracy",
  "Ideal for professional call recordings and meetings",
  "Perfect for academic lectures and research interviews",
  "Multi-speaker detection for multi-party recordings",
  "50+ language support",
  "Timestamped SRT export for captioning",
  "Secure, private — files deleted after transcription",
  "No registration, no cost",
];

const faqs = [
  { question: "Why use WAV for transcription?", answer: "WAV is an uncompressed audio format, which means every detail is preserved. This typically results in higher transcription accuracy compared to compressed formats like MP3." },
  { question: "Can it handle long WAV recordings?", answer: "Yes, up to 500 MB. Long meetings or lectures can be transcribed as a single file, or split into segments for faster processing." },
  { question: "Is WAV to text useful for call centers?", answer: "Absolutely. Customer service calls, support recordings, and conference calls in WAV format can be transcribed with speaker labeling enabled." },
  { question: "Can I use the transcript as meeting notes?", answer: "Yes! Copy the transcript directly or download as TXT and paste into your meeting notes, Notion, Google Docs, or any editor." },
  { question: "How quickly is a WAV file transcribed?", answer: "Most files under 60 minutes are transcribed in under a minute. Larger files may take a little longer." },
];

export default function WavToTextPage() {
  return <FileToolPage tool={tool} relatedTools={relatedTools} steps={steps} whyPoints={whyPoints} faqs={faqs} />;
}
