import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: {
    default: "TranscribeX — Free AI Transcription Tools for Audio & Video",
    template: "%s | TranscribeX",
  },
  description:
    "Free AI-powered transcription tools. Convert audio, video, and YouTube content to text with 99.8% accuracy. Supports 50+ languages, speaker detection, and SRT export.",
  keywords: [
    "audio to text",
    "video transcription",
    "YouTube transcript",
    "speech to text",
    "MP3 to text",
    "MP4 to text",
    "AI transcription",
    "free transcription",
    "subtitle generator",
    "online transcriber",
  ],
  authors: [{ name: "TranscribeX" }],
  creator: "TranscribeX",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "TranscribeX",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "TranscribeX — AI Transcription Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@transcribex",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body>
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
