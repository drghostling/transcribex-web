"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  CaretRight,
  CloudArrowUp,
  Gear,
  CheckCircle,
  ArrowRight,
  Spinner,
} from "@phosphor-icons/react";
import UploadZone from "./UploadZone";
import ProgressBar from "./ProgressBar";
import ResultCard from "./ResultCard";
import Toast from "@/components/ui/Toast";
import FAQ from "@/components/ui/FAQ";
import type { ToolConfig } from "@/lib/tools";

interface RelatedTool {
  href: string;
  label: string;
}

interface FileToolPageProps {
  tool: ToolConfig;
  relatedTools: RelatedTool[];
  faqs: { question: string; answer: string }[];
  steps: { title: string; desc: string }[];
  whyPoints: string[];
}

export default function FileToolPage({
  tool,
  relatedTools,
  faqs,
  steps,
  whyPoints,
}: FileToolPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("English");
  const [multiSpeaker, setMultiSpeaker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ transcript: string; wordCount: number; charCount: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const languages = [
    "English", "Spanish", "French", "German", "Portuguese", "Italian",
    "Japanese", "Korean", "Chinese (Simplified)", "Arabic", "Turkish",
    "Russian", "Dutch", "Polish", "Swedish", "Norwegian", "Danish",
    "Finnish", "Greek", "Czech", "Romanian", "Hungarian", "Ukrainian",
    "Thai", "Vietnamese", "Indonesian", "Malay", "Hindi", "Bengali",
  ];

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
  }, []);

  const handleTranscribe = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setResult(null);

    // Fake progress animation
    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 12 : p));
    }, 400);

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "file",
          filename: file.name,
          language,
          format: "txt",
          multiSpeaker,
        }),
      });

      clearInterval(interval);
      setProgress(100);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Transcription failed");
      }

      const data = await res.json();
      setResult(data);
      setToast({ message: "Transcription complete!", type: "success" });
    } catch (err) {
      clearInterval(interval);
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
            <span className="text-brand-text-2 font-medium">{tool.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-text-1 mb-4">
            {tool.title}
          </h1>
          <p className="text-lg text-brand-text-3 max-w-xl mx-auto">{tool.description}</p>
        </div>
      </section>

      {/* Tool Card */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-brand-border rounded-2xl bg-white shadow-card overflow-hidden">
            {/* Upload */}
            <div className="p-6">
              <UploadZone
                acceptedFormats={tool.acceptedFormats ?? []}
                onFile={handleFile}
                disabled={loading}
              />
              {file && !loading && !result && (
                <div className="mt-3 flex items-center gap-2 text-sm text-brand-text-2 bg-brand-bg-2 rounded-lg px-4 py-2.5">
                  <CheckCircle size={16} className="text-green-500 shrink-0" weight="fill" />
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-brand-text-3 shrink-0">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              )}
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
                    className="w-4 h-4 rounded border-brand-border text-primary-500 focus:ring-primary-500"
                  />
                  <label htmlFor="multiSpeaker" className="text-sm font-medium text-brand-text-2 select-none">
                    Multiple speakers
                  </label>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="px-6 py-4 border-t border-brand-border">
              {loading && (
                <div className="mb-4">
                  <ProgressBar progress={progress} label="Transcribing..." />
                </div>
              )}
              <button
                onClick={handleTranscribe}
                disabled={!file || loading}
                className="btn-gradient w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner size={18} className="spinner" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <CloudArrowUp size={18} />
                    Transcribe Now
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
                  filename={file?.name.replace(/\.[^.]+$/, "")}
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
            <span className="section-label mb-4">How It Works</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text-1">3 simple steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((step, i) => (
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

      {/* Why TranscribeX */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text-1">Why TranscribeX?</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {whyPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 p-4 rounded-xl bg-brand-bg-2 border border-brand-border">
                <CheckCircle size={18} weight="fill" className="text-primary-500 shrink-0 mt-0.5" />
                <p className="text-sm text-brand-text-2">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-brand-bg-2">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text-1">
              Frequently asked questions
            </h2>
          </div>
          <FAQ items={faqs} />
        </div>
      </section>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
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
                  {label}
                  <ArrowRight size={12} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
