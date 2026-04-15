import type { Metadata } from "next";
import FileToolPage from "@/components/tools/FileToolPage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "FLAC to Text Converter — Free AI Transcription",
  description: "Convert FLAC audio to text online for free. Lossless audio transcription with 99.8% AI accuracy and SRT export.",
  alternates: { canonical: `${siteUrl}/flac-to-text` },
  openGraph: {
    url: `${siteUrl}/flac-to-text`,
    title: "FLAC to Text Converter — Free AI Transcription | TranscribeX",
  },
};

const tool = {
  id: "flac-to-text",
  slug: "flac-to-text",
  title: "FLAC to Text Converter",
  shortTitle: "FLAC to Text",
  description: "Convert lossless FLAC audio files to text. Best quality transcription for studio recordings, archives, and high-fidelity audio.",
  metaTitle: "FLAC to Text Converter — Free AI Transcription | TranscribeX",
  metaDescription: "Convert FLAC audio to text online for free.",
  iconName: "Headphones",
  acceptedFormats: ["FLAC"],
  relatedTools: [],
};

const relatedTools = [
  { href: "/audio-to-text-converter", label: "Audio to Text" },
  { href: "/wav-to-text", label: "WAV to Text" },
  { href: "/mp3-to-text", label: "MP3 to Text" },
  { href: "/m4a-to-text", label: "M4A to Text" },
];

const steps = [
  { title: "Upload FLAC file", desc: "Drag and drop your lossless FLAC audio file onto the upload area." },
  { title: "Select options", desc: "Pick your language and speaker detection mode for maximum accuracy." },
  { title: "Get your transcript", desc: "The AI transcribes your FLAC file and delivers precise text output." },
];

const whyPoints = [
  "FLAC lossless quality delivers the best transcription accuracy",
  "Perfect for archival recordings, studio sessions, and audiobooks",
  "Handles complex audio with multiple speakers and overlapping speech",
  "50+ language support",
  "SRT subtitle export for any video editor",
  "No quality degradation — transcribe from the original lossless source",
  "Files processed securely and deleted immediately",
  "Free with no registration required",
];

const faqs = [
  { question: "What is FLAC audio?", answer: "FLAC (Free Lossless Audio Codec) is a high-quality audio format that compresses audio without any quality loss, unlike MP3. It's popular for archival recordings and audiophile content." },
  { question: "Does FLAC transcription give better results than MP3?", answer: "FLAC's lossless quality can improve transcription accuracy, especially for complex audio with multiple speakers or subtle speech nuances." },
  { question: "What are FLAC files used for?", answer: "FLAC is common in music archives, academic recordings, radio broadcasts, audiobooks, and any context where audio quality matters." },
  { question: "Can I convert a FLAC audiobook to text?", answer: "Yes! Upload your FLAC audiobook chapter and get a full text transcript. Note that audiobooks may have structured narration that transcribes cleanly." },
  { question: "Is the FLAC file deleted after transcription?", answer: "Yes. Your file is processed securely and deleted immediately after transcription. We never store your audio or transcript data." },
];

export default function FlacToTextPage() {
  return <FileToolPage tool={tool} relatedTools={relatedTools} steps={steps} whyPoints={whyPoints} faqs={faqs} />;
}
