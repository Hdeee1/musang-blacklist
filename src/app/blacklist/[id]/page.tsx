import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertOctagon,
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileImage,
  Share2,
  ShieldAlert,
} from "lucide-react";
import { getBlacklistEntryById } from "@/lib/search";

interface BlacklistDetailPageProps {
  readonly params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: BlacklistDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = await getBlacklistEntryById(id);

  if (!entry) {
    return {
      title: "Data Tidak Ditemukan — Musang Blacklist",
    };
  }

  const typeLabel = entry.identifierType === "BANK_ACCOUNT" ? "Rekening Bank" : "Nomor WhatsApp";
  const bankInfo = entry.bankName ? ` (${entry.bankName})` : "";

  return {
    title: `[BLACKLISTED] ${typeLabel} ${entry.identifierValue}${bankInfo} — Musang Blacklist`,
    description: `Peringatan penipuan: ${typeLabel} ${entry.identifierValue} tercatat dalam blacklist dengan ${entry.totalReports} laporan terverifikasi.`,
  };
}

export default async function BlacklistDetailPage({ params }: BlacklistDetailPageProps) {
  const { id } = await params;
  const entry = await getBlacklistEntryById(id);

  if (!entry) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href={`/search?q=${encodeURIComponent(entry.identifierValue)}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Hasil Pencarian
        </Link>
      </div>

      {/* Main Alert Banner */}
      <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-950 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-600 p-2 text-white shadow-sm dark:bg-red-700">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <span className="inline-block rounded-full bg-red-200 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-red-900 dark:bg-red-900/80 dark:text-red-100">
              Status Resmi: Blacklisted
            </span>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-red-700 dark:text-red-400 sm:text-3xl">
              TERVERIFIKASI PENIPU
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-red-900/80 dark:text-red-300">
              Rekam jejak nomor ini telah diputuskan valid oleh tim moderasi berdasarkan bukti
              transaksi nyata korban.
            </p>
          </div>
        </div>
      </div>

      {/* Target Details Card */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {entry.identifierType === "BANK_ACCOUNT" ? "Rekening Bank" : "Nomor WhatsApp"}
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                {entry.identifierValue}
              </span>
              {entry.bankName && (
                <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Bank {entry.bankName}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-800 dark:bg-red-950/80 dark:text-red-200">
              {entry.totalReports} Laporan Korban
            </div>
            <div className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-400">
              <Calendar className="h-3 w-3" />
              Laporan Terakhir: {new Date(entry.lastReportedAt).toLocaleDateString("id-ID")}
            </div>
          </div>
        </div>

        {/* Chronologies and Evidence */}
        <div className="mt-6 space-y-5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            Daftar Bukti dan Kronologi Kejadian:
          </h2>

          {entry.reports.map((rep, idx) => (
            <div
              key={rep.id}
              className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Laporan #{idx + 1}
                </span>
                <span>{new Date(rep.createdAt).toLocaleDateString("id-ID")}</span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {rep.chronology}
              </p>

              {rep.evidences.length > 0 && (
                <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-500">
                    Bukti Transaksi Terverifikasi ({rep.evidences.length} file):
                  </span>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {rep.evidences.map((ev, evIdx) => (
                      <a
                        key={ev.id}
                        href={ev.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-700 transition hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        <span className="flex items-center gap-1.5 font-medium truncate">
                          <FileImage className="h-4 w-4 text-slate-400" />
                          Bukti #{evIdx + 1}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-red-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Share2 className="h-4 w-4" />
            Salin tautan halaman ini untuk memperingatkan orang lain sebelum bertransaksi.
          </div>

          <Link
            href="/report"
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
          >
            Pernah Jadi Korban? Tambahkan Bukti
          </Link>
        </div>
      </div>
    </div>
  );
}
