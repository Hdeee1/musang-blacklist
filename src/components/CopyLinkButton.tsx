"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-subtle transition hover:bg-secondary"
      aria-label="Salin tautan halaman ke clipboard"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-success" />
          <span className="text-success font-bold">Tautan Tersalin!</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Salin Tautan Halaman</span>
        </>
      )}
    </button>
  );
}
