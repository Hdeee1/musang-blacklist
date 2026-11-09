"use client";

import { useEffect, useState } from "react";
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Riwayat Laporan Saya
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Daftar laporan penipuan yang telah Anda kirimkan dan status evaluasinya.
          </p>
        </div>
        <a
          href="/report"
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          + Buat Laporan Baru
        </a>
      </div>

      {loading && <div className="mt-8 text-center text-sm text-slate-500">Memuat laporan...</div>}

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <ShieldAlert className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-200">
            Belum Ada Laporan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Anda belum pernah mengirimkan laporan penipuan.
          </p>
          <a
            href="/report"
            className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Lapor Penipuan Sekarang
          </a>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="mt-6 space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {report.targetType === "BANK_ACCOUNT" ? "Rekening Bank" : "WhatsApp"}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                    {report.targetValue}
                  </span>
                  {report.bankName && (
                    <span className="text-xs text-slate-500">({report.bankName})</span>
                  )}
                </div>

                <div>
                  {report.status === "PENDING" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      <Clock className="h-3 w-3" /> Menunggu Evaluasi
                    </span>
                  )}
                  {report.status === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950/60 dark:text-red-300">
                      <CheckCircle2 className="h-3 w-3" /> Terverifikasi (Blacklisted)
                    </span>
                  )}
                  {report.status === "REJECTED" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      <XCircle className="h-3 w-3" /> Ditolak / Diarsipkan
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                <p className="font-medium text-xs text-slate-400 uppercase tracking-wider mb-1">
                  Kronologi:
                </p>
                <p className="whitespace-pre-line text-xs sm:text-sm">{report.chronology}</p>
              </div>

              {report.evidences.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Bukti Transaksi ({report.evidences.length} berkas):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {report.evidences.map((ev, i) => (
                      <a
                        key={ev.id}
                        href={ev.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <FileImage className="h-3.5 w-3.5 text-slate-400" />
                        Bukti #{i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 text-right text-xs text-slate-400">
                Dilaporkan pada {new Date(report.createdAt).toLocaleDateString("id-ID")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
