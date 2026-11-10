import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  FileImage,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { getBlacklistEntryById } from "@/lib/search";
import { CopyLinkButton } from "@/components/CopyLinkButton";

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
    <div className="mx-auto max-w-3xl py-4 sm:py-6 space-y-6">
      {/* Back button & share bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/search?q=${encodeURIComponent(entry.identifierValue)}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Pencarian</span>
        </Link>

        <CopyLinkButton />
      </div>

      {/* Main Scammer Warning Alert */}
      <div className="rounded-2xl border-2 border-destructive bg-destructive/10 p-5 sm:p-6 text-foreground shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-subtle">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-destructive px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-destructive-foreground">
                Status: Terverifikasi Penipu
              </span>
              <span className="text-xs font-semibold text-destructive">
                Daftar Hitam Terkonfirmasi
              </span>
            </div>
            <h1 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-destructive">
              REKAM JEJAK PENIPUAN TERBUKTI
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-foreground">
              Entri ini telah diputuskan valid oleh tim moderasi berdasarkan bukti transfer finansial nyata dari korban.
            </p>
          </div>
        </div>
      </div>

      {/* Blacklist Entry Details */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-6">
        {/* Identity Details */}
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
              Terakhir dilaporkan: {new Date(entry.lastReportedAt).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>

        {/* Incident Reports & Evidence */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Kronologi Kasus & Bukti Finansial Terverifikasi
          </h2>

          <div className="space-y-4">
            {entry.reports.map((rep, idx) => (
              <div
                key={rep.id}
                className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">
                    Laporan Korban #{idx + 1}
                  </span>
                  <span>{new Date(rep.createdAt).toLocaleDateString("id-ID")}</span>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {rep.chronology}
                </p>

                {rep.evidences.length > 0 && (
                  <div className="border-t border-border/60 pt-3">
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                      Bukti Slip / Chat ({rep.evidences.length} berkas):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {rep.evidences.map((ev, evIdx) => (
                        <a
                          key={ev.id}
                          href={ev.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 text-xs text-foreground shadow-subtle transition hover:border-primary hover:text-primary"
                        >
                          <span className="flex items-center gap-1.5 font-medium truncate">
                            <FileImage className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">Bukti #{evIdx + 1}</span>
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/80 pt-5">
          <p className="text-xs text-muted-foreground">
            Bantu sesama pembeli online: bagikan halaman ini saat mendapati nomor ini digunakan kembali.
          </p>

          <Link
            href="/report"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-subtle transition hover:opacity-95"
          >
            Tambahkan Bukti Laporan
          </Link>
        </div>
      </div>
    </div>
  );
}
