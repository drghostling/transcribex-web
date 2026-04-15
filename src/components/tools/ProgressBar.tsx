"use client";

interface ProgressBarProps {
  progress: number; // 0–100
  label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-brand-text-2 font-medium">{label}</span>
          <span className="text-brand-text-3">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-2 bg-brand-bg-3 rounded-full overflow-hidden">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
