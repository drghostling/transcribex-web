import type { Metadata } from "next";
import FileToolPage from "@/components/tools/FileToolPage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "Audio to Text Converter — Free AI Transcription",
  description: "Convert any audio file to accurate text transcripts powered by AI. Supports MP3, WAV, M4A, FLAC and more. Free online audio transcription tool.",
  alternates: { canonical: `${siteUrl}/audio-to-text-converter` },
  openGraph: {
    url: `${siteUrl}/audio-to-text-converter`,
    title: "Audio to Text Converter — Free AI Transcription | TranscribeX",
  },
};

const tool = {
  id: "audio-to-text",
  slug: "audio-to-text-converter",
  title: "Audio to Text Converter",
  shortTitle: "Audio to Text",
  description: "Convert any audio file to accurate text transcripts powered by AI. Supports MP3, WAV, M4A, FLAC, OGG, AAC and more.",
  metaTitle: "Audio to Text Converter — Free AI Transcription | TranscribeX",
  metaDescription: "Convert audio files to text instantly with AI accuracy.",
  iconName: "Waveform",
  acceptedFormats: ["MP3", "WAV", "M4A", "FLAC", "OGG", "AAC", "OPUS"],
  relatedTools: ["mp3-to-text", "wav-to-text", "m4a-to-text", "flac-to-text"],
};

const relatedTools = [
  { href: "/mp3-to-text", label: "MP3 to Text" },
  { href: "/wav-to-text", label: "WAV to Text" },
  { href: "/m4a-to-text", label: "M4A to Text" },
  { href: "/flac-to-text", label: "FLAC to Text" },
  { href: "/video-to-text-converter", label: "Video to Text" },
];

const steps = [
  { title: "Upload your audio", desc: "Drag and drop any audio file — MP3, WAV, M4A, FLAC, OGG, AAC, or OPUS." },
  { title: "Choose settings", desc: "Select your language and enable multi-speaker mode if needed." },
  { title: "Get your transcript", desc: "Click transcribe and download your text or SRT subtitle file." },
];

const whyPoints = [
  "Supports all major audio formats — MP3, WAV, M4A, FLAC, OGG, AAC, OPUS",
  "99.8% AI accuracy with background noise handling",
  "50+ languages including English, Spanish, French, German, Japanese",
  "Multi-speaker detection with automatic labeling",
  "Export as TXT or SRT subtitle files",
  "No account required — completely free",
  "Files processed securely and never stored",
  "Unlimited transcription with no watermarks",
];

const faqs = [
  { question: "What audio formats does the converter support?", answer: "TranscribeX supports MP3, WAV, M4A, FLAC, OGG, AAC, and OPUS audio formats. Simply upload your file and our AI will transcribe it." },
  { question: "Is there a file size limit?", answer: "Yes, the maximum file size is 500 MB per upload. For larger files, consider splitting them into shorter segments." },
  { question: "How accurate is the audio transcription?", answer: "Our AI achieves 99.8% accuracy on clear audio recordings. Accuracy may vary with heavy background noise or very low recording quality." },
  { question: "Can it transcribe multiple speakers?", answer: "Yes! Enable the multi-speaker option before transcribing, and the AI will label each speaker with [Speaker 1], [Speaker 2], etc." },
  { question: "Can I export the transcript as subtitles?", answer: "Yes. After transcription you can download the result as a TXT file or as an SRT subtitle file with automatic timestamps." },
];

export default function AudioToTextPage() {
  return <FileToolPage tool={tool} relatedTools={relatedTools} steps={steps} whyPoints={whyPoints} faqs={faqs} />;
}
