"use client";

import { useState } from "react";
import { Copy, DownloadSimple, Check } from "@phosphor-icons/react";

interface ResultCardProps {
  transcript: string;
  wordCount: number;
  charCount: number;
  filename?: string;
}

export default function ResultCard({ transcript, wordCount, charCount, filename }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename ? `${filename}.txt` : "transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSrt = () => {
    const sentences = transcript.split(". ").filter(Boolean);
    let srt = "";
    sentences.forEach((sentence, i) => {
      const start = i * 4;
      const end = start + 4;
      const fmt = (s: number) => {
        const h = Math.floor(s / 3600).toString().padStart(2, "0");
        const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
        const sec = (s % 60).toString().padStart(2, "0");
        return `${h}:${m}:${sec},000`;
      };
      srt += `${i + 1}\n${fmt(start)} --> ${fmt(end)}\n${sentence.trim()}.\n\n`;
    });
    const blob = new Blob([srt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename ? `${filename}.srt` : "subtitles.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card-gradient-border p-6">
      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-brand-border">
        <div>
          <p className="text-xs text-brand-text-3 mb-0.5">Words</p>
          <p className="text-lg font-bold text-gradient">{wordCount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-brand-text-3 mb-0.5">Characters</p>
          <p className="text-lg font-bold text-gradient">{charCount.toLocaleString()}</p>
        </div>
        {filename && (
          <div>
            <p className="text-xs text-brand-text-3 mb-0.5">Source</p>
            <p className="text-sm font-medium text-brand-text-2 truncate max-w-[180px]">{filename}</p>
          </div>
        )}
      </div>

      {/* Transcript */}
      <div className="bg-brand-bg-2 rounded-xl p-4 max-h-72 overflow-y-auto mb-4 text-sm text-brand-text-2 leading-relaxed whitespace-pre-wrap">
        {transcript}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={handleCopy} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button onClick={downloadTxt} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
          <DownloadSimple size={16} />
          TXT
        </button>
        <button onClick={downloadSrt} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
          <DownloadSimple size={16} />
          SRT
        </button>
      </div>
    </div>
  );
}
