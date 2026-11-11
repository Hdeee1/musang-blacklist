import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileImage,
  MessageSquare,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { searchBlacklistEntries } from "@/lib/search";

interface SearchPageProps {
  readonly searchParams: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  if (!q) {
    return {
      title: "Pencarian Rekam Jejak Penipuan — Musang Blacklist",
    };
  }

  return {
    title: `Pemeriksaan: ${q} — Musang Blacklist`,
    description: `Hasil verifikasi rekam jejak nomor rekening atau WhatsApp ${q} berdasarkan bukti transaksi nyata korban.`,
  };
}

export default async function SearchResultPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const rawQuery = q?.trim() || "";

  if (!rawQuery) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary mb-4">
          <Search className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Pemeriksaan Rekam Jejak Penipuan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Masukkan nomor rekening bank atau nomor WhatsApp yang ingin Anda periksa sebelum melakukan
          transfer.
        </p>
        <div className="mt-6">
          <form
            action="/search"
            method="GET"
            className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-card"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              name="q"
              required
              placeholder="Masukkan nomor rekening atau No. WhatsApp..."
              className="w-full bg-transparent px-2 py-2 text-sm font-mono text-foreground outline-none placeholder:text-muted-foreground placeholder:font-sans"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-subtle transition hover:opacity-95"
            >
              Cari
            </button>
          </form>
        </div>
      </div>
    );
  }

  const result = await searchBlacklistEntries(rawQuery);

  return (
    <div className="mx-auto max-w-3xl py-4 sm:py-6 space-y-6">
      {/* Search Bar at top */}
      <div className="rounded-xl border border-border bg-card p-2 shadow-subtle">
        <form action="/search" method="GET" className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={rawQuery}
              required
              placeholder="Cari nomor rekening bank atau WhatsApp..."
              className="w-full bg-transparent py-2 pl-10 pr-3 text-sm font-mono text-foreground outline-none placeholder:text-muted-foreground placeholder:font-sans"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-subtle transition hover:opacity-95"
          >
            Periksa Lagi
          </button>
        </form>
      </div>

      {/* Case 1: FOUND (BLACKLISTED) */}
      {result.found ? (
        <div className="space-y-6">
          {/* Main Scammer Warning Alert */}
          <div className="rounded-2xl border-2 border-destructive bg-destructive/10 p-5 sm:p-6 text-foreground shadow-card">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-subtle">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-destructive px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-destructive-foreground">
                    Peringatan: Terverifikasi Penipu
                  </span>
                  <span className="text-xs font-semibold text-destructive">
                    Daftar Hitam Terkonfirmasi
                  </span>
                </div>
                <h1 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-destructive">
                  JANGAN LAKUKAN TRANSFER KE NOMOR INI
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-foreground">
                  Nomor ini memiliki rekam jejak penipuan terkonfirmasi oleh tim kami berdasarkan
                  bukti slip transfer bank dan percakapan nyata dari para korban.
                </p>
              </div>
            </div>
          </div>

          {/* Blacklist Entry Cards */}
          {result.entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-6"
            >
              {/* Identity Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    {entry.identifierType === "BANK_ACCOUNT" ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                        <Building2 className="h-3.5 w-3.5 text-primary" /> Rekening Bank
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" /> WhatsApp
                      </span>
                    )}

                    {entry.bankName && (
                      <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                        Bank {entry.bankName}
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground select-all">
                      {entry.identifierValue}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1 border-t sm:border-t-0 border-border/60 pt-3 sm:pt-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-3 py-1 text-xs font-bold text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {entry.totalReports} Laporan Korban
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    Update terakhir: {new Date(entry.lastReportedAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Reports & Evidences */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Daftar Kronologi & Bukti Transaksi Nyata
                </h2>

                <div className="space-y-4">
                  {entry.reports.map((rep, idx) => (
                    <div
                      key={rep.id}
                      className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-bold text-foreground">Laporan Kasus #{idx + 1}</span>
                        <span>{new Date(rep.createdAt).toLocaleDateString("id-ID")}</span>
                      </div>

                      <p className="text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {rep.chronology}
                      </p>

                      {rep.evidences.length > 0 && (
                        <div className="border-t border-border/60 pt-3">
                          <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                            Bukti Slip Transfer / Chat Terverifikasi ({rep.evidences.length} file):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {rep.evidences.map((ev, evIdx) => (
                              <a
                                key={ev.id}
                                href={ev.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-subtle transition hover:border-primary hover:text-primary"
                              >
                                <FileImage className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Lihat Bukti #{evIdx + 1}</span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/80 pt-4">
                <Link
                  href={`/blacklist/${entry.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:underline"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Buka Halaman Permanen / Bagikan</span>
                </Link>

                <Link
                  href="/report"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-subtle transition hover:opacity-95"
                >
                  Laporkan Bukti Tambahan
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Case 2: NOT FOUND (CLEAN / NOT YET REPORTED) */
        <div className="rounded-2xl border border-success/40 bg-card p-6 sm:p-10 text-center shadow-card space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <div>
            <span className="inline-block rounded-md bg-success/20 px-3 py-1 text-xs font-bold text-success">
              Status: Belum Tercatat dalam Database Blacklist
            </span>
            <h1 className="mt-3 font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground select-all">
              {result.query}
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Nomor rekening atau nomor WhatsApp ini belum pernah dilaporkan atau belum masuk dalam
              data penipuan terkonfirmasi kami.
            </p>
          </div>

          <div className="mx-auto max-w-lg rounded-xl border border-border bg-secondary/40 p-4 text-left text-xs leading-relaxed space-y-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" />
              <div>
                <strong className="text-foreground">Kewaspadaan Tetap Diperlukan:</strong> Status
                belum tercatat bukan jaminan mutlak 100% aman. Pelaku penipuan online kerap berganti
                nomor rekening baru atau meminjam rekening pihak ketiga.
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground pl-6">
              Selalu gunakan rekening bersama (Rekber) independen tepercaya atau sistem escrow resmi
              marketplace saat bertransaksi P2P.
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/report"
              className="inline-flex items-center justify-center rounded-xl bg-secondary border border-border px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary/80"
            >
              Pernah Ditipu oleh Nomor Ini? Kirim Laporan dengan Bukti Transfer
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
