"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MessageSquare, Search, ShieldCheck } from "lucide-react";

export function SearchConsole() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bank" | "whatsapp">("bank");
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
  };

  const handleQuickExample = (value: string, tab: "bank" | "whatsapp") => {
    setActiveTab(tab);
    setQuery(value);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-card">
      {/* Segmented Mode Selector */}
      <div className="flex rounded-xl bg-secondary p-1 border border-border/60">
        <button
          type="button"
          onClick={() => {
            setActiveTab("bank");
            setQuery("");
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === "bank"
              ? "bg-card text-foreground shadow-subtle border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4 text-primary" />
          <span>Nomor Rekening Bank</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("whatsapp");
            setQuery("");
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === "whatsapp"
              ? "bg-card text-foreground shadow-subtle border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4 text-primary" />
          <span>Nomor WhatsApp</span>
        </button>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="mt-4">
        <label htmlFor="search-input" className="sr-only">
          {activeTab === "bank"
            ? "Cari nomor rekening bank"
            : "Cari nomor WhatsApp penjual atau rekber"}
        </label>
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              id="search-input"
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeTab === "bank"
                  ? "Masukkan nomor rekening (misal: 1234567890)"
                  : "Masukkan nomor WhatsApp (misal: 08123456789 atau +62812...)"
              }
              className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm sm:text-base font-mono text-foreground placeholder:text-muted-foreground placeholder:font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-subtle transition hover:opacity-95"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Periksa Rekam Jejak</span>
          </button>
        </div>
      </form>

      {/* Validation Note & Fast Demo Links */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
          {activeTab === "bank"
            ? "Pencarian otomatis mengenali BCA, Mandiri, BRI, BNI, Seabank, Jago, dll."
            : "Format +62 dan 08 secara otomatis dinormalisasi oleh sistem."}
        </span>

        <div className="flex items-center gap-1.5 font-sans">
          <span>Contoh cepat:</span>
          <button
            type="button"
            onClick={() => handleQuickExample("1234567890", "bank")}
            className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground transition hover:border-primary hover:text-primary"
          >
            1234567890 (BCA)
          </button>
          <button
            type="button"
            onClick={() => handleQuickExample("08123456789", "whatsapp")}
            className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground transition hover:border-primary hover:text-primary"
          >
            08123456789 (WA)
          </button>
        </div>
      </div>
    </div>
  );
}
