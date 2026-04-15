import type { Metadata } from "next";
import YouTubeToTextClient from "./YouTubeToTextClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "YouTube to Text Converter — Free AI Transcript",
  description:
    "Convert any YouTube video to text instantly. Free AI transcription with 99.8% accuracy, 50+ languages, multi-speaker detection, and SRT subtitle export. No download required.",
  alternates: { canonical: `${siteUrl}/youtube-to-text` },
  openGraph: {
    url: `${siteUrl}/youtube-to-text`,
    title: "YouTube to Text Converter — Free AI Transcript | TranscribeX",
    description:
      "Paste a YouTube URL and get a full text transcript in seconds. Free, accurate, 50+ languages supported.",
  },
  twitter: {
    title: "YouTube to Text Converter — Free AI Transcript | TranscribeX",
    description:
      "Paste a YouTube URL and get a full text transcript in seconds. Free, accurate, 50+ languages supported.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "YouTube to Text Converter",
      url: `${siteUrl}/youtube-to-text`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free AI-powered YouTube video transcription tool. Convert any YouTube video to accurate text in 50+ languages with multi-speaker detection and SRT export.",
      featureList: [
        "AI transcription with 99.8% accuracy",
        "50+ language support",
        "Multi-speaker detection",
        "SRT subtitle export",
        "No download required",
        "Free with no registration",
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "YouTube to Text", item: `${siteUrl}/youtube-to-text` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I transcribe a YouTube video?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Paste any YouTube video URL into the input field, select your language, and click Transcribe. The AI generates a full text transcript in seconds.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to download the video first?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Just paste the YouTube URL — TranscribeX fetches the content and transcribes it directly without downloading anything to your device.",
          },
        },
        {
          "@type": "Question",
          name: "Can I get subtitles from a YouTube video?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! After transcription, download the SRT subtitle file and upload it back to YouTube or use it in any video editor.",
          },
        },
        {
          "@type": "Question",
          name: "What languages are supported?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "50+ languages including English, Spanish, French, German, Japanese, Korean, Chinese, Arabic, Portuguese, Turkish and many more.",
          },
        },
      ],
    },
  ],
};

export default function YouTubeToTextPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <YouTubeToTextClient />
    </>
  );
}
