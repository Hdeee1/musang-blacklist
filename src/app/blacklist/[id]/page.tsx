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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Hasil Pencarian
        </Link>
      </div>

      {/* Main Alert Banner */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-foreground shadow-soft">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-destructive p-2.5 text-destructive-foreground shadow-soft">
            <AlertOctagon className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <span className="inline-block rounded-full bg-destructive/20 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-destructive">
              Status Resmi: Blacklisted
            </span>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-destructive sm:text-3xl">
              TERVERIFIKASI PENIPU
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Rekam jejak nomor ini telah diputuskan valid oleh tim moderasi berdasarkan bukti
              transaksi nyata korban.
            </p>
          </div>
        </div>
      </div>

      {/* Target Details Card */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div>
            <span className="rounded-lg border border-border/70 bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {entry.identifierType === "BANK_ACCOUNT" ? "Rekening Bank" : "Nomor WhatsApp"}
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {entry.identifierValue}
              </span>
              {entry.bankName && (
                <span className="rounded-lg bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                  Bank {entry.bankName}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="rounded-lg bg-destructive/15 px-3 py-1 text-xs font-bold text-destructive">
              {entry.totalReports} Laporan Korban
            </div>
            <div className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Laporan Terakhir: {new Date(entry.lastReportedAt).toLocaleDateString("id-ID")}
            </div>
          </div>
        </div>

        {/* Chronologies and Evidence */}
        <div className="mt-6 space-y-5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Daftar Bukti dan Kronologi Kejadian:
          </h2>

          {entry.reports.map((rep, idx) => (
            <div key={rep.id} className="rounded-xl border border-border/60 bg-secondary/30 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-foreground">Laporan #{idx + 1}</span>
                <span>{new Date(rep.createdAt).toLocaleDateString("id-ID")}</span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-foreground">{rep.chronology}</p>

              {rep.evidences.length > 0 && (
                <div className="mt-4 border-t border-border/60 pt-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Bukti Transaksi Terverifikasi ({rep.evidences.length} file):
                  </span>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {rep.evidences.map((ev, evIdx) => (
                      <a
                        key={ev.id}
                        href={ev.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-lg border border-border bg-card p-2.5 text-xs text-foreground shadow-soft transition hover:border-primary hover:text-primary"
                      >
                        <span className="flex items-center gap-1.5 font-medium truncate">
                          <FileImage className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          Bukti #{evIdx + 1}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Share2 className="h-4 w-4" />
            Salin tautan halaman ini untuk memperingatkan orang lain sebelum bertransaksi.
          </div>

          <Link
            href="/report"
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft transition hover:bg-primary/90"
          >
            Pernah Jadi Korban? Tambahkan Bukti
          </Link>
        </div>
      </div>
    </div>
  );
}
