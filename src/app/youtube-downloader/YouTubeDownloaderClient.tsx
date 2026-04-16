"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CaretRight,
  ArrowCircleDown,
  CheckCircle,
  ArrowRight,
  Spinner,
  Link as LinkIcon,
} from "@phosphor-icons/react";
import Toast from "@/components/ui/Toast";
import FAQ from "@/components/ui/FAQ";

interface FormatOption {
  label: string;
  ext: string;
  type: "video" | "audio";
  qualities?: string[];
}

const formats: FormatOption[] = [
  { label: "MP4", ext: "mp4", type: "video", qualities: ["1080p", "720p", "480p", "360p"] },
  { label: "MP3", ext: "mp3", type: "audio" },
  { label: "WEBM", ext: "webm", type: "video", qualities: ["1080p", "720p"] },
  { label: "M4A", ext: "m4a", type: "audio" },
  { label: "OGG", ext: "ogg", type: "audio" },
];

const faqs = [
  { question: "What formats can I download YouTube videos in?", answer: "TranscribeX supports downloading YouTube videos as MP4, WEBM (video) and MP3, M4A, OGG (audio). Choose your preferred format from the list." },
  { question: "Can I download YouTube videos as MP3?", answer: "Yes! Select MP3 from the format list and the audio will be extracted from the video and saved as an MP3 file." },
  { question: "Is this free?", answer: "Yes, the YouTube Downloader is completely free. No account, no credit card, no limits." },
  { question: "Does it work on iPhone and Android?", answer: "Yes! TranscribeX works on any modern browser including Safari on iPhone and Chrome on Android." },
  { question: "Is it legal to download YouTube videos?", answer: "Downloading YouTube videos may violate YouTube's Terms of Service. Only download videos you have permission to download or that are licensed for download." },
];

export default function YouTubeDownloaderClient() {
  const [url, setUrl] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>(formats[0]);
  const [quality, setQuality] = useState("1080p");
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
        body: JSON.stringify({
          url,
          format: selectedFormat.ext,
          quality: selectedFormat.qualities ? quality : undefined,
        }),
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

  const handleFormatChange = (fmt: FormatOption) => {
    setSelectedFormat(fmt);
    setDownloadUrl(null);
    if (fmt.qualities) setQuality(fmt.qualities[0]);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-brand-bg-2 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-brand-text-3">
            <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
            <CaretRight size={12} />
            <span className="text-brand-text-2 font-medium">YouTube Downloader</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="icon-gradient w-16 h-16 rounded-2xl mx-auto mb-6">
            <ArrowCircleDown size={32} weight="fill" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-text-1 mb-4">
            YouTube Downloader
          </h1>
          <p className="text-lg text-brand-text-3 max-w-xl mx-auto">
            Download YouTube videos in MP4, MP3, WEBM, M4A and OGG formats. Free, fast, unlimited.
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

            {/* Format picker */}
            <div className="border-t border-brand-border px-6 py-4 bg-brand-bg-2">
              <p className="text-xs font-semibold text-brand-text-2 mb-3">Format</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {formats.map((fmt) => (
                  <button
                    key={fmt.ext}
                    onClick={() => handleFormatChange(fmt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedFormat.ext === fmt.ext
                        ? "border-primary-500 bg-primary-50 text-primary-600 shadow-brand"
                        : "border-brand-border text-brand-text-3 hover:border-primary-300 bg-white"
                    }`}
                  >
                    {fmt.label}
                    <span className="block text-[10px] opacity-60 mt-0.5">{fmt.type}</span>
                  </button>
                ))}
              </div>

              {selectedFormat.qualities && (
                <>
                  <p className="text-xs font-semibold text-brand-text-2 mb-2">Quality</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedFormat.qualities.map((q) => (
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
                </>
              )}
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
                    <ArrowCircleDown size={18} weight="bold" />
                    Download {selectedFormat.label}
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
                      <p className="text-xs text-green-600">
                        Format: {selectedFormat.label.toUpperCase()}
                        {selectedFormat.qualities ? ` • Quality: ${quality}` : " • Audio only"}
                      </p>
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

      {/* Why */}
      <section className="py-16 sm:py-20 bg-brand-bg-2">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-text-1 text-center mb-8">Why TranscribeX?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "5 formats: MP4, MP3, WEBM, M4A, OGG",
              "Multiple quality options including HD",
              "No watermark or registration required",
              "Works on desktop, tablet, and mobile",
              "Fast processing — download in seconds",
              "Completely free with no limits",
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
              { href: "/youtube-to-mp4", label: "YouTube to MP4" },
              { href: "/youtube-to-text", label: "YouTube to Text" },
              { href: "/mp3-to-text", label: "MP3 to Text" },
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
