"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, FileImage, ShieldAlert, XCircle } from "lucide-react";

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
          setError(data.detail || "Gagal memuat daftar laporan");
          return;
        }
        setReports(data.reports || []);
      } catch {
        setError("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Riwayat Laporan Saya
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar laporan penipuan yang telah Anda kirimkan dan status evaluasinya.
          </p>
        </div>
        <Link
          href="/report"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
        >
          + Buat Laporan Baru
        </Link>
      </div>

      {loading && (
        <div className="mt-12 text-center text-sm font-medium text-muted-foreground">
          Memuat riwayat laporan...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive shadow-soft">
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-card">
          <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-3 text-base font-bold text-foreground">Belum Ada Laporan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Anda belum pernah mengirimkan laporan penipuan.
          </p>
          <Link
            href="/report"
            className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
          >
            Lapor Penipuan Sekarang
          </Link>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="mt-6 space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-soft sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg border border-border/70 bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {report.targetType === "BANK_ACCOUNT" ? "Rekening Bank" : "WhatsApp"}
                  </span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {report.targetValue}
                  </span>
                  {report.bankName && (
                    <span className="text-xs font-medium text-muted-foreground">
                      ({report.bankName})
                    </span>
                  )}
                </div>

                <div>
                  {report.status === "PENDING" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/15 px-3 py-0.5 text-xs font-semibold text-warning">
                      <Clock className="h-3 w-3" /> Menunggu Evaluasi
                    </span>
                  )}
                  {report.status === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/15 px-3 py-0.5 text-xs font-semibold text-destructive">
                      <CheckCircle2 className="h-3 w-3" /> Masuk Blacklist
                    </span>
                  )}
                  {report.status === "REJECTED" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-0.5 text-xs font-semibold text-muted-foreground">
                      <XCircle className="h-3 w-3" /> Ditolak
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {report.chronology}
                </p>

                {report.rejectionReason && (
                  <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    <strong>Alasan Penolakan:</strong> {report.rejectionReason}
                  </div>
                )}

                {report.evidences.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {report.evidences.map((ev, idx) => (
                      <a
                        key={ev.id}
                        href={ev.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-xs text-foreground shadow-soft transition hover:border-primary hover:text-primary"
                      >
                        <FileImage className="h-3 w-3 text-muted-foreground" />
                        Bukti #{idx + 1}
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-3 text-right text-xs text-muted-foreground">
                  Tanggal Lapor: {new Date(report.createdAt).toLocaleDateString("id-ID")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
