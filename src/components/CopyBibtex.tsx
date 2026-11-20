"use client";

import { useState } from "react";

export function CopyBibtex({
  bibtex,
  label,
  copiedLabel,
}: {
  bibtex: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard 미지원 환경 무시 */
    }
  };

  return (
    <button type="button" onClick={copy} className="cursor-pointer font-semibold text-accent hover:underline underline-offset-4">
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
