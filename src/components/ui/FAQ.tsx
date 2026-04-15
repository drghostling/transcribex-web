"use client";

import { useState } from "react";
import { Plus, Minus } from "@phosphor-icons/react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-brand-border rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-brand-text-1 hover:bg-brand-bg-2 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="text-sm sm:text-base">{item.question}</span>
            {open === i ? (
              <Minus size={18} className="text-primary-500 shrink-0" />
            ) : (
              <Plus size={18} className="text-brand-text-3 shrink-0" />
            )}
          </button>
          <div className={`accordion-content ${open === i ? "open" : ""}`}>
            <p className="px-5 pb-4 text-sm text-brand-text-3 leading-relaxed">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
