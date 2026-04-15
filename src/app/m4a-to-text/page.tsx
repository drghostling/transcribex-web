import type { Metadata } from "next";
import FileToolPage from "@/components/tools/FileToolPage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "M4A to Text Converter — Free AI Transcription",
  description: "Convert M4A files to text online for free. Supports Apple Voice Memos, iTunes audio, podcast exports with 99.8% AI accuracy.",
  alternates: { canonical: `${siteUrl}/m4a-to-text` },
  openGraph: {
    url: `${siteUrl}/m4a-to-text`,
    title: "M4A to Text Converter — Free AI Transcription | TranscribeX",
  },
};

const tool = {
  id: "m4a-to-text",
  slug: "m4a-to-text",
  title: "M4A to Text Converter",
  shortTitle: "M4A to Text",
  description: "Convert M4A audio files to text transcripts instantly. Perfect for Apple Voice Memos, iTunes audio, and podcast recordings.",
  metaTitle: "M4A to Text Converter — Free AI Transcription | TranscribeX",
  metaDescription: "Convert M4A files to text online for free.",
  iconName: "SpeakerHigh",
  acceptedFormats: ["M4A"],
  relatedTools: [],
};

const relatedTools = [
  { href: "/audio-to-text-converter", label: "Audio to Text" },
  { href: "/mp3-to-text", label: "MP3 to Text" },
  { href: "/wav-to-text", label: "WAV to Text" },
  { href: "/flac-to-text", label: "FLAC to Text" },
];

const steps = [
  { title: "Upload M4A file", desc: "Drag and drop your M4A audio file or click to browse from your device." },
  { title: "Set preferences", desc: "Choose your language from 50+ options and toggle speaker detection." },
  { title: "Download your transcript", desc: "Receive your text transcript. Export as TXT or SRT in one click." },
];

const whyPoints = [
  "Optimized for M4A — Apple Voice Memos, QuickTime, iTunes audio",
  "99.8% transcription accuracy with AI processing",
  "Great for iPhone recordings and podcast exports",
  "Multi-speaker detection and labeling",
  "50+ language support",
  "SRT subtitle export for video projects",
  "Files deleted immediately after processing",
  "Free and no signup required",
];

const faqs = [
  { question: "What is an M4A file?", answer: "M4A is Apple's audio format used by iPhone Voice Memos, iTunes, and many podcast apps. It's an AAC audio file in an MPEG-4 container." },
  { question: "How do I convert Apple Voice Memos to text?", answer: "Export your Voice Memo from the iPhone as an M4A file, then upload it here. The AI will transcribe it accurately in seconds." },
  { question: "Can I transcribe podcast M4A exports?", answer: "Yes! M4A is a common podcast export format. Upload the file, enable multi-speaker if needed, and get a full transcript with speaker labels." },
  { question: "Does it support M4A files with accents?", answer: "Our AI handles a wide range of accents and dialects. For best results, select the correct language before transcribing." },
  { question: "Is my M4A file safe?", answer: "Yes. Files are encrypted during upload, processed securely, and deleted immediately after transcription. We never retain your audio." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "M4A to Text Converter",
      url: `${siteUrl}/m4a-to-text`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: "Free M4A to text converter. Transcribe Apple Voice Memos, podcast exports, and M4A audio files with 99.8% AI accuracy.",
      featureList: ["M4A transcription", "Apple Voice Memos support", "99.8% AI accuracy", "50+ languages", "Speaker detection", "Free, no registration"],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "M4A to Text Converter", item: `${siteUrl}/m4a-to-text` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

export default function M4aToTextPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FileToolPage tool={tool} relatedTools={relatedTools} steps={steps} whyPoints={whyPoints} faqs={faqs} />
    </>
  );
}
