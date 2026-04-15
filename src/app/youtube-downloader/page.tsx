import type { Metadata } from "next";
import YouTubeDownloaderClient from "./YouTubeDownloaderClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "YouTube Downloader — MP4, MP3, WEBM, M4A Free",
  description:
    "Download YouTube videos and audio in MP4, MP3, WEBM, M4A, and OGG formats. Free online YouTube downloader — no software, no registration, works on all devices.",
  alternates: { canonical: `${siteUrl}/youtube-downloader` },
  openGraph: {
    url: `${siteUrl}/youtube-downloader`,
    title: "YouTube Downloader — MP4, MP3, WEBM, M4A Free | TranscribeX",
    description:
      "Download YouTube videos in MP4, MP3, WEBM, M4A, and OGG. Free, fast, unlimited — no software or registration required.",
  },
  twitter: {
    title: "YouTube Downloader — MP4, MP3, WEBM, M4A Free | TranscribeX",
    description:
      "Download YouTube videos in MP4, MP3, WEBM, M4A, and OGG. Free, fast, unlimited — no software or registration required.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "YouTube Downloader",
      url: `${siteUrl}/youtube-downloader`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free YouTube downloader supporting MP4, MP3, WEBM, M4A, and OGG formats with multiple quality options.",
      featureList: [
        "5 output formats: MP4, MP3, WEBM, M4A, OGG",
        "Multiple quality options up to 1080p",
        "Audio extraction to MP3",
        "No registration or software required",
        "Works on desktop and mobile",
        "Free and unlimited",
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "YouTube Downloader", item: `${siteUrl}/youtube-downloader` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What formats can I download YouTube videos in?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "TranscribeX supports downloading YouTube videos as MP4, WEBM (video) and MP3, M4A, OGG (audio). Choose your preferred format from the list.",
          },
        },
        {
          "@type": "Question",
          name: "Can I download YouTube videos as MP3?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! Select MP3 from the format list and the audio will be extracted from the video and saved as an MP3 file.",
          },
        },
        {
          "@type": "Question",
          name: "Is this free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, the YouTube Downloader is completely free. No account, no credit card, no limits.",
          },
        },
        {
          "@type": "Question",
          name: "Does it work on iPhone and Android?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! TranscribeX works on any modern browser including Safari on iPhone and Chrome on Android.",
          },
        },
      ],
    },
  ],
};

export default function YouTubeDownloaderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <YouTubeDownloaderClient />
    </>
  );
}
