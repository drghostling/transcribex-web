import type { Metadata } from "next";
import YouTubeToMp4Client from "./YouTubeToMp4Client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "YouTube to MP4 Converter — Download 4K Videos Free",
  description:
    "Download YouTube videos as MP4 in up to 4K quality. Free YouTube to MP4 converter — no watermark, no registration, works on all devices. Fast and unlimited.",
  alternates: { canonical: `${siteUrl}/youtube-to-mp4` },
  openGraph: {
    url: `${siteUrl}/youtube-to-mp4`,
    title: "YouTube to MP4 Converter — Download 4K Videos Free | TranscribeX",
    description:
      "Download YouTube videos as MP4 in up to 4K quality. Free, fast, no watermark, no registration required.",
  },
  twitter: {
    title: "YouTube to MP4 Converter — Download 4K Videos Free | TranscribeX",
    description:
      "Download YouTube videos as MP4 in up to 4K quality. Free, fast, no watermark, no registration required.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "YouTube to MP4 Converter",
      url: `${siteUrl}/youtube-to-mp4`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free YouTube to MP4 converter. Download YouTube videos in up to 4K quality with no watermark or registration.",
      featureList: [
        "Up to 4K Ultra HD quality",
        "No watermarks",
        "Works on any device",
        "No registration required",
        "Fast processing",
        "Free with no limits",
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "YouTube to MP4", item: `${siteUrl}/youtube-to-mp4` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I download a YouTube video as MP4?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Paste the YouTube video URL into the field above, choose your preferred quality (up to 4K), and click Download. The MP4 file will be saved to your device.",
          },
        },
        {
          "@type": "Question",
          name: "Is YouTube to MP4 conversion free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, TranscribeX YouTube to MP4 is completely free. No registration or credit card required.",
          },
        },
        {
          "@type": "Question",
          name: "Can I download 4K YouTube videos?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, when a video is available in 4K, you can select 4K (2160p) quality. Note that not all videos are published in 4K.",
          },
        },
        {
          "@type": "Question",
          name: "What devices does this work on?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "TranscribeX works on any device with a modern browser — Windows, Mac, Linux, iOS, and Android. No app or installation needed.",
          },
        },
      ],
    },
  ],
};

export default function YouTubeToMp4Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <YouTubeToMp4Client />
    </>
  );
}
