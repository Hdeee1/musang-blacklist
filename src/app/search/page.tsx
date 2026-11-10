import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertOctagon,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileImage,
  Search,
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
    title: `Cek ${q} — Hasil Pencarian Musang Blacklist`,
    description: `Hasil verifikasi rekam jejak nomor rekening atau nomor WhatsApp ${q} di Musang Blacklist.`,
  };
}

export default async function SearchResultPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const rawQuery = q?.trim() || "";

  if (!rawQuery) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Pencarian Blacklist
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Masukkan nomor rekening bank atau nomor WhatsApp yang ingin Anda periksa.
        </p>
        <div className="mt-6">
          <form
            action="/search"
            method="GET"
            className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              name="q"
              placeholder="Masukkan nomor rekening atau No. WA..."
              className="w-full bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
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
    <div className="mx-auto max-w-3xl py-6">
      {/* Search Bar at top */}
      <div className="mb-8">
        <form
          action="/search"
          method="GET"
          className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card transition-shadow hover:shadow-soft"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={rawQuery}
              placeholder="Cari nomor rekening bank atau WhatsApp..."
              className="w-full bg-transparent py-2 pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Case 1: FOUND (BLACKLISTED) */}
      {result.found ? (
        <div className="space-y-6">
          {/* Main Status Header */}
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-foreground shadow-soft">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-destructive p-2.5 text-destructive-foreground shadow-soft">
                <AlertOctagon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <span className="inline-block rounded-full bg-destructive/20 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-destructive">
                  Status: Blacklisted
                </span>
                <h1 className="mt-1.5 text-2xl font-black tracking-tight text-destructive sm:text-3xl">
                  TERCATAT DALAM DAFTAR PENIPU
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Peringatan keras! Nomor ini telah dilaporkan oleh korban dan telah diverifikasi
                  oleh tim kami dengan bukti transaksi nyata.{" "}
                  <strong className="text-destructive font-semibold">
                    JANGAN LAKUKAN TRANSFER
                  </strong>{" "}
                  ke nomor ini.
                </p>
              </div>
            </div>
          </div>

          {/* Blacklist Entry Details */}
          {result.entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
                <div>
                  <span className="rounded-lg border border-border/70 bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {entry.identifierType === "BANK_ACCOUNT" ? "Rekening Bank" : "Nomor WhatsApp"}
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {entry.identifierValue}
                    </span>
                    {entry.bankName && (
                      <span className="rounded-lg bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                        Bank {entry.bankName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="rounded-lg bg-destructive/15 px-3 py-1 text-xs font-bold text-destructive">
                    {entry.totalReports} Laporan Terverifikasi
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Terakhir: {new Date(entry.lastReportedAt).toLocaleDateString("id-ID")}
                  </div>
                </div>
              </div>

              {/* Reports and Evidences */}
              <div className="mt-5 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Kronologi & Bukti Transaksi Nyata:
                </h2>

                {entry.reports.map((rep, idx) => (
                  <div
                    key={rep.id}
                    className="rounded-xl border border-border/60 bg-secondary/30 p-4"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Laporan Korban #{idx + 1}
                      </span>
                      <span>{new Date(rep.createdAt).toLocaleDateString("id-ID")}</span>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-foreground">{rep.chronology}</p>

                    {rep.evidences.length > 0 && (
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Bukti Screenshot ({rep.evidences.length} file):
                        </span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {rep.evidences.map((ev, evIdx) => (
                            <a
                              key={ev.id}
                              href={ev.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-soft transition hover:border-primary hover:text-primary"
                            >
                              <FileImage className="h-3.5 w-3.5 text-muted-foreground" />
                              Lihat Bukti #{evIdx + 1}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                <Link
                  href={`/blacklist/${entry.id}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Bagikan Halaman Detail Ini →
                </Link>
                <Link
                  href="/report"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft transition hover:bg-primary/90"
                >
                  Laporkan Bukti Tambahan
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Case 2: NOT FOUND (CLEAN / NOT YET REPORTED) */
        <div className="rounded-2xl border border-success/30 bg-card p-8 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <ShieldCheck className="h-9 w-9" />
          </div>

          <span className="mt-4 inline-block rounded-full bg-success/20 px-3.5 py-1 text-xs font-bold text-success">
            Status: Data Bersih / Belum Dilaporkan
          </span>

          <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {result.query}
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Nomor rekening atau nomor WhatsApp ini <strong>belum pernah dilaporkan</strong> atau
            belum masuk dalam database blacklist terverifikasi kami.
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-xl border border-border bg-secondary/40 p-4 text-left text-xs leading-relaxed text-muted-foreground">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success mt-0.5" />
              <div>
                <strong className="text-foreground">Tips Keamanan Transaksi:</strong> Data bersih
                bukan jaminan 100% bebas risiko karena pelaku mungkin baru menggunakan rekening
                tersebut. Selalu utamakan menggunakan Rekber (Rekening Bersama) terpercaya saat
                bertransaksi P2P di media sosial.
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/report"
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
            >
              Pernah Ditipu Nomor Ini? Laporkan Sekarang
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
