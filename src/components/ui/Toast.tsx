"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "@phosphor-icons/react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`toast fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-brand text-sm font-medium ${
        type === "success"
          ? "bg-white border border-green-100 text-green-800"
          : "bg-white border border-red-100 text-red-800"
      }`}
    >
      {type === "success" ? (
        <CheckCircle size={18} className="text-green-500 shrink-0" weight="fill" />
      ) : (
        <XCircle size={18} className="text-red-500 shrink-0" weight="fill" />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 text-current opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}
