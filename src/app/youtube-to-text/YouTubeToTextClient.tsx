"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CaretRight,
  YoutubeLogo,
  CheckCircle,
  ArrowRight,
  Spinner,
  Link as LinkIcon,
} from "@phosphor-icons/react";
import ResultCard from "@/components/tools/ResultCard";
import Toast from "@/components/ui/Toast";
import FAQ from "@/components/ui/FAQ";

const languages = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian",
  "Japanese", "Korean", "Chinese (Simplified)", "Arabic", "Turkish",
  "Russian", "Dutch", "Polish", "Swedish", "Hindi", "Bengali",
];

const faqs = [
  { question: "How do I transcribe a YouTube video?", answer: "Paste any YouTube video URL into the input field, select your language, and click Transcribe. The AI generates a full text transcript in seconds." },
  { question: "Do I need to download the video first?", answer: "No. Just paste the YouTube URL — TranscribeX fetches the content and transcribes it directly without downloading anything to your device." },
  { question: "Can I get subtitles from a YouTube video?", answer: "Yes! After transcription, download the SRT subtitle file and upload it back to YouTube or use it in any video editor." },
  { question: "Does it work with private YouTube videos?", answer: "TranscribeX only works with publicly accessible YouTube videos. Private or age-restricted videos cannot be transcribed." },
  { question: "What languages are supported?", answer: "50+ languages including English, Spanish, French, German, Japanese, Korean, Chinese, Arabic, Portuguese, Turkish and many more." },
];

const relatedTools = [
  { href: "/youtube-to-mp4", label: "YouTube to MP4" },
  { href: "/youtube-downloader", label: "YouTube Downloader" },
  { href: "/video-to-text-converter", label: "Video to Text" },
  { href: "/mp3-to-text", label: "MP3 to Text" },
];

export default function YouTubeToTextClient() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [multiSpeaker, setMultiSpeaker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ transcript: string; wordCount: number; charCount: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isValidYouTube = (v: string) =>
    /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(v);

  const handleTranscribe = async () => {
    if (!isValidYouTube(url)) {
      setToast({ message: "Please enter a valid YouTube URL.", type: "error" });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "youtube", url, language, format: "txt", multiSpeaker }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Transcription failed");
      }

      const data = await res.json();
      setResult(data);
      setToast({ message: "Transcript ready!", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-brand-bg-2 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-brand-text-3">
            <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
            <CaretRight size={12} />
            <span className="text-brand-text-2 font-medium">YouTube to Text</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="icon-gradient w-16 h-16 rounded-2xl mx-auto mb-6">
            <YoutubeLogo size={32} weight="fill" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-text-1 mb-4">
            YouTube to Text Converter
          </h1>
          <p className="text-lg text-brand-text-3 max-w-xl mx-auto">
            Paste any YouTube URL and get a full text transcript in seconds. Free, accurate, 50+ languages.
          </p>
        </div>
      </section>

      {/* Tool Card */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-brand-border rounded-2xl bg-white shadow-card overflow-hidden">
            {/* URL Input */}
            <div className="p-6">
              <label className="block text-sm font-semibold text-brand-text-2 mb-2">
                YouTube URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-3" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTranscribe()}
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={loading}
                    className="w-full border border-brand-border rounded-xl pl-9 pr-4 py-3 text-sm text-brand-text-1 placeholder:text-brand-text-3 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="border-t border-brand-border px-6 py-4 bg-brand-bg-2">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-semibold text-brand-text-2 mb-1.5">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={loading}
                    className="w-full border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {languages.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="multiSpeaker"
                    checked={multiSpeaker}
                    onChange={(e) => setMultiSpeaker(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 rounded border-brand-border text-primary-500"
                  />
                  <label htmlFor="multiSpeaker" className="text-sm font-medium text-brand-text-2 select-none">
                    Multiple speakers
                  </label>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="px-6 py-4 border-t border-brand-border">
              <button
                onClick={handleTranscribe}
                disabled={!url || loading}
                className="btn-gradient w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner size={18} className="spinner" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <YoutubeLogo size={18} weight="fill" />
                    Transcribe Video
                  </>
                )}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="px-6 pb-6">
                <ResultCard
                  transcript={result.transcript}
                  wordCount={result.wordCount}
                  charCount={result.charCount}
                  filename="youtube-transcript"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-brand-bg-2">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text-1">3 simple steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: "Paste YouTube URL", desc: "Copy the URL from any YouTube video and paste it into the input field above." },
              { title: "Select language", desc: "Choose the video's language for best accuracy. Enable multi-speaker if needed." },
              { title: "Download transcript", desc: "Get your full transcript in TXT or SRT format — ready to copy or download." },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="icon-gradient w-12 h-12 rounded-2xl mx-auto mb-4 font-bold text-lg">
                  {i + 1}
                </div>
                <h3 className="font-bold text-brand-text-1 mb-2">{step.title}</h3>
                <p className="text-sm text-brand-text-3">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-text-1 text-center mb-8">Why TranscribeX?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Transcribe any public YouTube video instantly",
              "50+ language support including non-English videos",
              "Multi-speaker detection for interviews and debates",
              "SRT subtitle export for video editors",
              "No download or installation required",
              "Free — no registration, no credit card",
            ].map((p) => (
              <div key={p} className="flex items-start gap-3 p-4 rounded-xl bg-brand-bg-2 border border-brand-border">
                <CheckCircle size={18} weight="fill" className="text-primary-500 shrink-0 mt-0.5" />
                <p className="text-sm text-brand-text-2">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-brand-bg-2">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-text-1 text-center mb-8">Frequently asked questions</h2>
          <FAQ items={faqs} />
        </div>
      </section>

      {/* Related */}
      <section className="py-12 bg-white border-t border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-brand-text-1 mb-5">Related tools</h2>
          <div className="flex flex-wrap gap-3">
            {relatedTools.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-4 py-2 border border-brand-border rounded-full text-sm text-brand-text-2 hover:border-primary-500 hover:text-primary-500 transition-colors"
              >
                {label} <ArrowRight size={12} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
