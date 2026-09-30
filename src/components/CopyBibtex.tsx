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
    <button onClick={copy} className="hover:text-foreground">
      [{copied ? copiedLabel : label}]
    </button>
  );
}
