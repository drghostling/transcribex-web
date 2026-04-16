"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CaretRight,
  DownloadSimple,
  CheckCircle,
  ArrowRight,
  Spinner,
  Link as LinkIcon,
  VideoCamera,
} from "@phosphor-icons/react";
import Toast from "@/components/ui/Toast";
import FAQ from "@/components/ui/FAQ";

const qualities = ["4K (2160p)", "1080p HD", "720p HD", "480p SD", "360p"];

const faqs = [
  { question: "How do I download a YouTube video as MP4?", answer: "Paste the YouTube video URL into the field above, choose your preferred quality (up to 4K), and click Download. The MP4 file will be saved to your device." },
  { question: "Is YouTube to MP4 conversion free?", answer: "Yes, TranscribeX YouTube to MP4 is completely free. No registration or credit card required." },
  { question: "Can I download 4K YouTube videos?", answer: "Yes, when a video is available in 4K, you can select 4K (2160p) quality. Note that not all videos are published in 4K." },
  { question: "Is it legal to download YouTube videos?", answer: "Downloading YouTube videos may violate YouTube's terms of service. Only download content you have rights to or that is in the public domain. Always respect copyright." },
  { question: "What devices does this work on?", answer: "TranscribeX works on any device with a modern browser — Windows, Mac, Linux, iOS, and Android. No app or installation needed." },
];

export default function YouTubeToMp4Client() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("1080p HD");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isValidYouTube = (v: string) =>
    /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(v);

  const handleDownload = async () => {
    if (!isValidYouTube(url)) {
      setToast({ message: "Please enter a valid YouTube URL.", type: "error" });
      return;
    }
    setLoading(true);
    setDownloadUrl(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format: "mp4", quality }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Download failed");
      setDownloadUrl(data.downloadUrl);
      window.open(data.downloadUrl, "_blank");
      setToast({ message: "Download started!", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Download failed", type: "error" });
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
            <span className="text-brand-text-2 font-medium">YouTube to MP4</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="icon-gradient w-16 h-16 rounded-2xl mx-auto mb-6">
            <VideoCamera size={32} weight="fill" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-text-1 mb-4">
            YouTube to MP4 Converter
          </h1>
          <p className="text-lg text-brand-text-3 max-w-xl mx-auto">
            Download YouTube videos as MP4 in up to 4K quality. Fast, free, no watermark.
          </p>
        </div>
      </section>

      {/* Tool Card */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-brand-border rounded-2xl bg-white shadow-card overflow-hidden">
            <div className="p-6">
              <label className="block text-sm font-semibold text-brand-text-2 mb-2">YouTube URL</label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-3" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setDownloadUrl(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={loading}
                  className="w-full border border-brand-border rounded-xl pl-9 pr-4 py-3 text-sm text-brand-text-1 placeholder:text-brand-text-3 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 bg-white"
                />
              </div>
            </div>

            <div className="border-t border-brand-border px-6 py-4 bg-brand-bg-2">
              <label className="block text-xs font-semibold text-brand-text-2 mb-1.5">Quality</label>
              <div className="flex flex-wrap gap-2">
                {qualities.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      quality === q
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-brand-border text-brand-text-3 hover:border-primary-300"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-border">
              <button
                onClick={handleDownload}
                disabled={!url || loading}
                className="btn-gradient w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner size={18} className="spinner" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DownloadSimple size={18} weight="bold" />
                    Download MP4
                  </>
                )}
              </button>
            </div>

            {downloadUrl && (
              <div className="px-6 pb-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} weight="fill" className="text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Download started!</p>
                      <p className="text-xs text-green-600">Quality: {quality} &bull; Format: MP4</p>
                    </div>
                  </div>
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-semibold text-primary-600 underline"
                  >
                    Click here if it didn&apos;t start
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="py-16 sm:py-20 bg-brand-bg-2">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-text-1 text-center mb-8">Why TranscribeX?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Download up to 4K Ultra HD quality",
              "No watermarks or quality degradation",
              "Works on any device — desktop or mobile",
              "No registration or software required",
              "Fast processing and instant download",
              "Free with no limits",
            ].map((p) => (
              <div key={p} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-brand-border">
                <CheckCircle size={18} weight="fill" className="text-primary-500 shrink-0 mt-0.5" />
                <p className="text-sm text-brand-text-2">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-text-1 text-center mb-8">Frequently asked questions</h2>
          <FAQ items={faqs} />
        </div>
      </section>

      {/* Related */}
      <section className="py-12 bg-brand-bg-2 border-t border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-brand-text-1 mb-5">Related tools</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { href: "/youtube-downloader", label: "YouTube Downloader" },
              { href: "/youtube-to-text", label: "YouTube to Text" },
              { href: "/mp4-to-text", label: "MP4 to Text" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="flex items-center gap-1.5 px-4 py-2 border border-brand-border rounded-full text-sm text-brand-text-2 hover:border-primary-500 hover:text-primary-500 transition-colors">
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
