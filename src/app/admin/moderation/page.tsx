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
      <div className="flex flex-col justify-between gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-soft">
              <Shield className="h-5 w-5 text-primary" />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Dashboard Moderasi Laporan
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Evaluasi bukti transaksi yang dikirimkan pelapor sebelum data penipu dipublikasikan ke
            pencarian publik.
          </p>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          role="alert"
          className={`mt-4 rounded-2xl border p-4 text-sm font-semibold shadow-soft ${
            actionAlert.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {actionAlert.message}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border/70 pb-4">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "PENDING"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          }`}
        >
          <Clock className="h-4 w-4" />
          Antrean Menunggu Evaluasi
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              activeTab === "PENDING"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-card text-muted-foreground border border-border/60"
            }`}
          >
            {statusCounts.PENDING}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("APPROVED")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "APPROVED"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Telah Disetujui (Blacklisted)
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              activeTab === "APPROVED"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-card text-muted-foreground border border-border/60"
            }`}
          >
            {statusCounts.APPROVED}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("REJECTED")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "REJECTED"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          }`}
        >
          <XCircle className="h-4 w-4" />
          Ditolak / Arsip
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              activeTab === "REJECTED"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-card text-muted-foreground border border-border/60"
            }`}
          >
            {statusCounts.REJECTED}
          </span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-sm font-medium text-muted-foreground">
          Memuat antrean moderasi...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive shadow-soft">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Gagal Memuat Data
          </div>
          <p className="mt-1 text-xs">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reports.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-card">
          <Filter className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 text-base font-bold text-foreground">Tidak Ada Laporan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
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
              className="rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-soft"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg border border-border/70 bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                    {report.targetType === "BANK_ACCOUNT" ? "Rekening Bank" : "WhatsApp"}
                  </span>
                  <span className="font-mono text-base font-extrabold text-foreground sm:text-lg">
                    {report.targetValue}
                  </span>
                  {report.bankName && (
                    <span className="rounded-lg bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                      Bank {report.bankName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Dilaporkan {new Date(report.createdAt).toLocaleString("id-ID")}
                </div>
              </div>

              {/* Reporter Info */}
              <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-secondary/30 p-3 text-xs text-foreground">
                <div>
                  <span className="text-muted-foreground">Pelapor:</span>{" "}
                  <strong className="font-semibold text-foreground">{report.reporter.email}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">Skor Reputasi:</span>{" "}
                  <strong className="font-bold text-primary">
                    {report.reporter.reputationScore} poin
                  </strong>
                </div>
              </div>

              {/* Chronology */}
              <div className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Kronologi Penipuan:
                </h3>
                <p className="mt-1.5 whitespace-pre-line rounded-xl border border-border/60 bg-secondary/20 p-3.5 text-sm leading-relaxed text-foreground">
                  {report.chronology}
                </p>
              </div>

              {/* Evidence Gallery */}
              <div className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Bukti Tangkapan Layar ({report.evidences.length} berkas):
                </h3>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {report.evidences.map((ev, idx) => (
                    <a
                      key={ev.id}
                      href={ev.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition hover:border-primary"
                    >
                      <div className="flex h-36 items-center justify-center bg-secondary/50 p-2">
                        <img
                          src={ev.fileUrl}
                          alt={`Bukti #${idx + 1}`}
                          className="max-h-full max-w-full rounded object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-xs text-muted-foreground group-hover:text-primary">
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
                <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
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
                      className="block w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        id={`spam-${report.id}`}
                        type="checkbox"
                        checked={isSpamFlags[report.id] || false}
                        onChange={(e) =>
                          setIsSpamFlags((prev) => ({ ...prev, [report.id]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={`spam-${report.id}`}
                        className="text-xs text-muted-foreground"
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
                        className="flex items-center gap-1.5 rounded-xl bg-success px-4 py-2 text-xs font-bold text-success-foreground shadow-soft transition hover:bg-success/90 disabled:opacity-50"
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
                        className="flex items-center gap-1.5 rounded-xl border border-destructive/40 bg-card px-4 py-2 text-xs font-bold text-destructive shadow-soft transition hover:bg-destructive/10 disabled:opacity-50"
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
                <div className="mt-4 border-t border-border/70 pt-3 text-xs">
                  {report.status === "APPROVED" && (
                    <div className="flex items-center gap-1.5 text-success font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      Laporan ini telah disetujui dan data penipu aktif di pencarian publik.
                    </div>
                  )}
                  {report.status === "REJECTED" && (
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-destructive">Laporan Ditolak:</span>{" "}
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
