"use client";

import { useRef, useState, useCallback } from "react";
import { CloudArrowUp, File } from "@phosphor-icons/react";

interface UploadZoneProps {
  acceptedFormats: string[];
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({ acceptedFormats, onFile, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const accept = acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(",");

  const handleFile = useCallback(
    (f: File) => {
      if (!disabled) onFile(f);
    },
    [disabled, onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  return (
    <div
      className={`upload-zone p-10 text-center ${dragOver ? "drag-over" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload file"
      onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-4">
        <div
          className={`icon-gradient w-16 h-16 rounded-2xl transition-all duration-200 ${
            dragOver ? "scale-110" : ""
          }`}
        >
          <CloudArrowUp size={32} weight="bold" />
        </div>
        <div>
          <p className="text-base font-semibold text-brand-text-1 mb-1">
            {dragOver ? "Drop your file here" : "Drag & drop your file here"}
          </p>
          <p className="text-sm text-brand-text-3">
            or <span className="text-primary-500 font-medium">browse files</span>
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5 mt-1">
          {acceptedFormats.map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 text-xs font-semibold bg-primary-50 text-primary-600 rounded-full border border-primary-100"
            >
              {fmt}
            </span>
          ))}
        </div>
        <p className="text-xs text-brand-text-3">Max file size: 500 MB</p>
      </div>
    </div>
  );
}
