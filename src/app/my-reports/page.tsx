"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileImage,
  MessageSquare,
  Plus,
  ShieldAlert,
  XCircle,
} from "lucide-react";

interface ReportItem {
  readonly id: string;
  readonly targetType: "BANK_ACCOUNT" | "WHATSAPP";
  readonly targetValue: string;
  readonly bankName: string | null;
  readonly chronology: string;
  readonly status: "PENDING" | "APPROVED" | "REJECTED";
  readonly rejectionReason: string | null;
  readonly createdAt: string;
  readonly evidences: Array<{
    readonly id: string;
    readonly fileUrl: string;
    readonly fileSize: number;
    readonly mimeType: string;
  }>;
}

export default function MyReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        if (!res.ok) {
          setError(data.detail || "Gagal memuat riwayat laporan.");
          return;
        }
        setReports(data.reports || []);
      } catch {
        setError("Terjadi kesalahan jaringan saat memuat data.");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  return (
    <div className="mx-auto max-w-4xl py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Riwayat Laporan Saya
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Daftar laporan penipuan yang telah Anda kirimkan dan status evaluasinya oleh tim
            kurator.
          </p>
        </div>
        <Link
          href="/report"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-subtle transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Laporan Baru</span>
        </Link>
      </div>

      {loading && (
        <div className="py-12 text-center text-xs sm:text-sm text-muted-foreground">
          Memuat riwayat laporan Anda...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive shadow-subtle">
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-subtle space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">Belum Ada Laporan Terkirim</h2>
          <p className="mx-auto max-w-md text-xs text-muted-foreground leading-relaxed">
            Anda belum pernah mengirimkan laporan penipuan. Kontribusi bukti transfer Anda sangat
            membantu mencegah korban penipuan berikutnya.
          </p>
          <div className="pt-2">
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle transition hover:opacity-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Kirim Laporan Sekarang</span>
            </Link>
          </div>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-subtle space-y-4 transition hover:border-primary/50"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  {report.targetType === "BANK_ACCOUNT" ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                      <Building2 className="h-3.5 w-3.5 text-primary" /> Bank
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" /> WhatsApp
                    </span>
                  )}

                  <span className="font-mono text-sm sm:text-base font-bold text-foreground">
                    {report.targetValue}
                  </span>

                  {report.bankName && (
                    <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                      Bank {report.bankName}
                    </span>
                  )}
                </div>

                <div>
                  {report.status === "PENDING" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/15 px-3 py-0.5 text-xs font-semibold text-warning">
                      <Clock className="h-3 w-3" /> Menunggu Kurasi
                    </span>
                  )}
                  {report.status === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/15 px-3 py-0.5 text-xs font-semibold text-success">
                      <CheckCircle2 className="h-3 w-3" /> Disetujui (Blacklist Aktif)
                    </span>
                  )}
                  {report.status === "REJECTED" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-0.5 text-xs font-semibold text-muted-foreground">
                      <XCircle className="h-3 w-3" /> Ditolak / Tidak Valid
                    </span>
                  )}
                </div>
              </div>

              {/* Chronology & rejection note */}
              <div className="space-y-3">
                <p className="text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {report.chronology}
                </p>

                {report.rejectionReason && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive space-y-1">
                    <strong className="block font-semibold">Catatan Tim Peninjau:</strong>
                    <p>{report.rejectionReason}</p>
                  </div>
                )}

                {/* Evidence links */}
                {report.evidences.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {report.evidences.map((ev, idx) => (
                      <a
                        key={ev.id}
                        href={ev.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-xs text-foreground shadow-subtle transition hover:border-primary hover:text-primary"
                      >
                        <FileImage className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Bukti #{idx + 1}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground pt-1">
                  <Calendar className="h-3 w-3" />
                  <span>Diajukan: {new Date(report.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
