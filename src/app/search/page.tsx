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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Pencarian Blacklist
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Masukkan nomor rekening bank atau nomor WhatsApp yang ingin Anda periksa.
        </p>
        <div className="mt-6">
          <form action="/search" method="GET" className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder="Masukkan nomor rekening atau No. WA..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
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
        <form action="/search" method="GET" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={rawQuery}
              placeholder="Cari nomor rekening bank atau WhatsApp..."
              className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Case 1: FOUND (BLACKLISTED) */}
      {result.found ? (
        <div className="space-y-6">
          {/* Main Status Header */}
          <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-950 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-600 p-2 text-white shadow-sm dark:bg-red-700">
                <AlertOctagon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <span className="inline-block rounded-full bg-red-200 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-red-900 dark:bg-red-900/80 dark:text-red-100">
                  Status: Blacklisted
                </span>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-red-700 dark:text-red-400 sm:text-3xl">
                  TERCATAT DALAM DAFTAR PENIPU
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-red-900/80 dark:text-red-300">
                  Peringatan keras! Nomor ini telah dilaporkan oleh korban dan telah diverifikasi
                  oleh tim kami dengan bukti transaksi nyata.{" "}
                  <strong>JANGAN LAKUKAN TRANSFER</strong> ke nomor ini.
                </p>
              </div>
            </div>
          </div>

          {/* Blacklist Entry Details */}
          {result.entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {entry.identifierType === "BANK_ACCOUNT" ? "Rekening Bank" : "Nomor WhatsApp"}
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
                      {entry.identifierValue}
                    </span>
                    {entry.bankName && (
                      <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        Bank {entry.bankName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                    {entry.totalReports} Laporan Terverifikasi
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    Terakhir: {new Date(entry.lastReportedAt).toLocaleDateString("id-ID")}
                  </div>
                </div>
              </div>

              {/* Reports and Evidences */}
              <div className="mt-5 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Kronologi & Bukti Transaksi Nyata:
                </h2>

                {entry.reports.map((rep, idx) => (
                  <div
                    key={rep.id}
                    className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Laporan Korban #{idx + 1}
                      </span>
                      <span>{new Date(rep.createdAt).toLocaleDateString("id-ID")}</span>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                      {rep.chronology}
                    </p>

                    {rep.evidences.length > 0 && (
                      <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                        <span className="text-xs font-semibold text-slate-500">
                          Bukti Screenshot ({rep.evidences.length} file):
                        </span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {rep.evidences.map((ev, evIdx) => (
                            <a
                              key={ev.id}
                              href={ev.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                            >
                              <FileImage className="h-3.5 w-3.5 text-slate-400" />
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
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Link
                  href={`/blacklist/${entry.id}`}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Bagikan Halaman Detail Ini →
                </Link>
                <Link
                  href="/report"
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                >
                  Laporkan Bukti Tambahan
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Case 2: NOT FOUND (CLEAN / NOT YET REPORTED) */
        <div className="rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm dark:border-emerald-900/60 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ShieldCheck className="h-9 w-9" />
          </div>

          <span className="mt-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            Status: Data Bersih / Belum Dilaporkan
          </span>

          <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            {result.query}
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Nomor rekening atau nomor WhatsApp ini <strong>belum pernah dilaporkan</strong> atau
            belum masuk dalam database blacklist terverifikasi kami.
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <div>
                <strong>Tips Keamanan Transaksi:</strong> Data bersih bukan jaminan 100% bebas
                risiko karena pelaku mungkin baru menggunakan rekening tersebut. Selalu utamakan
                menggunakan Rekber (Rekening Bersama) terpercaya saat bertransaksi P2P di media
                sosial.
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/report"
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Pernah Ditipu Nomor Ini? Laporkan Sekarang
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
