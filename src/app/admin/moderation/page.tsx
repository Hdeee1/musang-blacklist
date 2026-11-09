"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileImage,
  Filter,
  Shield,
  XCircle,
} from "lucide-react";

interface EvidenceItem {
  readonly id: string;
  readonly fileUrl: string;
  readonly fileSize: number;
  readonly mimeType: string;
}

interface ReporterInfo {
  readonly id: string;
  readonly email: string;
  readonly reputationScore: number;
}

interface ReportItem {
  readonly id: string;
  readonly targetType: "BANK_ACCOUNT" | "WHATSAPP";
  readonly targetValue: string;
  readonly bankName: string | null;
  readonly chronology: string;
  readonly status: "PENDING" | "APPROVED" | "REJECTED";
  readonly rejectionReason: string | null;
  readonly createdAt: string;
  readonly reporter: ReporterInfo;
  readonly evidences: EvidenceItem[];
  readonly reviewedBy: { id: string; email: string } | null;
}

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [statusCounts, setStatusCounts] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action form state per card
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [isSpamFlags, setIsSpamFlags] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [actionAlert, setActionAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchReports = async (tab: "PENDING" | "APPROVED" | "REJECTED") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports?status=${tab}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Gagal memuat antrean laporan");
        return;
      }

      setReports(data.reports || []);
      if (data.statusCounts) {
        setStatusCounts(data.statusCounts);
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(activeTab);
  }, [activeTab]);

  const handleModerate = async (reportId: string, action: "APPROVE" | "REJECT") => {
    setActionLoading((prev) => ({ ...prev, [reportId]: true }));
    setActionAlert(null);

    const notes = actionNotes[reportId] || "";
    const isSpam = isSpamFlags[reportId] || false;

    try {
      const res = await fetch(`/api/admin/reports/${reportId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes, isSpam }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionAlert({
          type: "error",
          message: data.detail || "Gagal mengeksekusi aksi moderasi.",
        });
        return;
      }

      setActionAlert({
        type: "success",
        message: data.message,
      });

      // Refresh list
      fetchReports(activeTab);
    } catch {
      setActionAlert({
        type: "error",
        message: "Terjadi kesalahan jaringan saat mengirim aksi moderasi.",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-5xl py-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-500" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Dashboard Moderasi Laporan
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Evaluasi bukti transaksi yang dikirimkan pelapor sebelum data penipu dipublikasikan ke
            pencarian publik.
          </p>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          role="alert"
          className={`mt-4 rounded-xl p-4 text-sm font-medium ${
            actionAlert.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200"
              : "bg-red-50 text-red-900 border border-red-300 dark:bg-red-950/50 dark:text-red-200"
          }`}
        >
          {actionAlert.message}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "PENDING"
              ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Clock className="h-4 w-4" />
          Antrean Menunggu Evaluasi
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs text-amber-900 dark:bg-amber-900 dark:text-amber-100">
            {statusCounts.PENDING}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("APPROVED")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "APPROVED"
              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Telah Disetujui (Blacklisted)
          <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
            {statusCounts.APPROVED}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("REJECTED")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "REJECTED"
              ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <XCircle className="h-4 w-4" />
          Ditolak / Arsip
          <span className="rounded-full bg-slate-300 px-2 py-0.5 text-xs text-slate-800 dark:bg-slate-700 dark:text-slate-200">
            {statusCounts.REJECTED}
          </span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-sm text-slate-500">Memuat antrean moderasi...</div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950/50 dark:text-red-200">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Gagal Memuat Data
          </div>
          <p className="mt-1 text-xs">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reports.length === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Filter className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-200">
            Tidak Ada Laporan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tidak ada laporan penipuan dengan status {activeTab} saat ini.
          </p>
        </div>
      )}

      {/* Reports Queue List */}
      {!loading && reports.length > 0 && (
        <div className="mt-6 space-y-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {report.targetType === "BANK_ACCOUNT" ? "Rekening Bank" : "WhatsApp"}
                  </span>
                  <span className="font-mono text-base font-extrabold text-slate-900 sm:text-lg dark:text-slate-100">
                    {report.targetValue}
                  </span>
                  {report.bankName && (
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      Bank {report.bankName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  Dilaporkan {new Date(report.createdAt).toLocaleString("id-ID")}
                </div>
              </div>

              {/* Reporter Info */}
              <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                <div>
                  <span className="text-slate-500">Pelapor:</span>{" "}
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">
                    {report.reporter.email}
                  </strong>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-slate-500">Skor Reputasi:</span>{" "}
                  <strong className="font-bold text-amber-600 dark:text-amber-400">
                    {report.reporter.reputationScore} poin
                  </strong>
                </div>
              </div>

              {/* Chronology */}
              <div className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Kronologi Penipuan:
                </h3>
                <p className="mt-1.5 whitespace-pre-line rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
                  {report.chronology}
                </p>
              </div>

              {/* Evidence Gallery */}
              <div className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Bukti Tangkapan Layar ({report.evidences.length} berkas):
                </h3>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {report.evidences.map((ev, idx) => (
                    <a
                      key={ev.id}
                      href={ev.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition hover:border-red-400 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="flex h-36 items-center justify-center bg-slate-100 p-2 dark:bg-slate-900">
                        <img
                          src={ev.fileUrl}
                          alt={`Bukti #${idx + 1}`}
                          className="max-h-full max-w-full rounded object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <FileImage className="h-3.5 w-3.5" />
                          Bukti #{idx + 1}
                        </span>
                        <ExternalLink className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Moderation Actions (Only for PENDING status) */}
              {report.status === "PENDING" && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Aksi Evaluasi Admin:
                  </h4>

                  <div className="mt-3 space-y-3">
                    <textarea
                      rows={2}
                      value={actionNotes[report.id] || ""}
                      onChange={(e) =>
                        setActionNotes((prev) => ({ ...prev, [report.id]: e.target.value }))
                      }
                      placeholder="Catatan verifikasi atau alasan penolakan (opsional untuk Approve, disarankan untuk Reject)..."
                      className="block w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        id={`spam-${report.id}`}
                        type="checkbox"
                        checked={isSpamFlags[report.id] || false}
                        onChange={(e) =>
                          setIsSpamFlags((prev) => ({ ...prev, [report.id]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <label
                        htmlFor={`spam-${report.id}`}
                        className="text-xs text-slate-600 dark:text-slate-400"
                      >
                        Tandai sebagai laporan palsu / spam (akan mengurangi 20 poin reputasi
                        pelapor bila ditolak)
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={actionLoading[report.id]}
                        onClick={() => handleModerate(report.id, "APPROVE")}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {actionLoading[report.id]
                          ? "Memproses..."
                          : "Setujui & Publikasikan (Approve)"}
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading[report.id]}
                        onClick={() => handleModerate(report.id, "REJECT")}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700 hover:border-red-300 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                      >
                        <XCircle className="h-4 w-4" />
                        {actionLoading[report.id] ? "Memproses..." : "Tolak & Arsipkan (Reject)"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Already reviewed info */}
              {report.status !== "PENDING" && (
                <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                  {report.status === "APPROVED" && (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      Laporan ini telah disetujui dan data penipu aktif di pencarian publik.
                    </div>
                  )}
                  {report.status === "REJECTED" && (
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        Laporan Ditolak:
                      </span>{" "}
                      {report.rejectionReason || "Tidak ada catatan penolakan."}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
