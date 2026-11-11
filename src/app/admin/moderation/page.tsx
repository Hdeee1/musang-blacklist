"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileImage,
  Filter,
  MessageSquare,
  Shield,
  ShieldCheck,
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
        setError(data.detail || "Gagal memuat antrean laporan.");
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
    <div className="mx-auto max-w-5xl py-4 sm:py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-subtle ring-1 ring-border">
              <Shield className="h-5 w-5 text-primary" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Konsol Moderasi Laporan
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Evaluasi bukti transfer finansial & percakapan sebelum entri blacklist dipublikasikan
            secara terbuka.
          </p>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          role="alert"
          className={`rounded-xl border p-4 text-xs sm:text-sm font-semibold shadow-subtle ${
            actionAlert.type === "success"
              ? "border-success/40 bg-success/10 text-success"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {actionAlert.message}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/70 pb-3">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === "PENDING"
              ? "bg-primary text-primary-foreground shadow-subtle"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Antrean Menunggu Evaluasi</span>
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
              activeTab === "PENDING"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            {statusCounts.PENDING}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("APPROVED")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === "APPROVED"
              ? "bg-primary text-primary-foreground shadow-subtle"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Telah Disetujui (Blacklisted)</span>
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
              activeTab === "APPROVED"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            {statusCounts.APPROVED}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("REJECTED")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === "REJECTED"
              ? "bg-primary text-primary-foreground shadow-subtle"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <XCircle className="h-4 w-4" />
          <span>Ditolak / Arsip</span>
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
              activeTab === "REJECTED"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            {statusCounts.REJECTED}
          </span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-xs sm:text-sm text-muted-foreground">
          Memuat data antrean laporan...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive shadow-subtle">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-4 w-4" />
            <span>Gagal Memuat Antrean</span>
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reports.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-subtle space-y-2">
          <Filter className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="text-base font-bold text-foreground">Tidak Ada Laporan</h2>
          <p className="text-xs text-muted-foreground">
            Tidak ada laporan dengan status {activeTab} dalam antrean saat ini.
          </p>
        </div>
      )}

      {/* Reports Queue List */}
      {!loading && reports.length > 0 && (
        <div className="space-y-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-5"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
                <div className="flex items-center gap-3">
                  {report.targetType === "BANK_ACCOUNT" ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                      <Building2 className="h-3.5 w-3.5 text-primary" /> Bank
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" /> WhatsApp
                    </span>
                  )}

                  <span className="font-mono text-lg sm:text-xl font-extrabold text-foreground">
                    {report.targetValue}
                  </span>

                  {report.bankName && (
                    <span className="rounded bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                      Bank {report.bankName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(report.createdAt).toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-secondary/30 p-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Pelapor:</span>{" "}
                  <strong className="text-foreground">{report.reporter.email}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">Skor Reputasi:</span>{" "}
                  <strong className="text-primary font-bold">
                    {report.reporter.reputationScore} poin
                  </strong>
                </div>
              </div>

              {/* Chronology */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Kronologi dari Pelapor:
                </h3>
                <p className="whitespace-pre-line rounded-xl border border-border/60 bg-secondary/20 p-3.5 text-xs sm:text-sm leading-relaxed text-foreground">
                  {report.chronology}
                </p>
              </div>

              {/* Evidence Gallery */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Bukti Tangkapan Layar ({report.evidences.length} berkas):
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {report.evidences.map((ev, idx) => (
                    <a
                      key={ev.id}
                      href={ev.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-subtle transition hover:border-primary"
                    >
                      <div className="flex h-36 items-center justify-center bg-secondary/40 p-2">
                        {/* Native img with dimensions and semantic alt */}
                        <img
                          src={ev.fileUrl}
                          alt={`Bukti transaksi #${idx + 1}`}
                          className="max-h-full max-w-full rounded object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground group-hover:text-primary">
                        <span className="flex items-center gap-1 font-medium">
                          <FileImage className="h-3.5 w-3.5" />
                          <span>Bukti #{idx + 1}</span>
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Moderation Actions (Only for PENDING status) */}
              {report.status === "PENDING" && (
                <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Aksi Keputusan Kurator:
                  </h4>

                  <textarea
                    rows={2}
                    value={actionNotes[report.id] || ""}
                    onChange={(e) =>
                      setActionNotes((prev) => ({ ...prev, [report.id]: e.target.value }))
                    }
                    placeholder="Catatan verifikasi atau alasan penolakan (opsional untuk Setujui, sangat dianjurkan untuk Tolak)..."
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
                    <label htmlFor={`spam-${report.id}`} className="text-xs text-muted-foreground">
                      Tandai sebagai laporan palsu / spam (mengurangi 20 poin reputasi pelapor bila
                      ditolak)
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={actionLoading[report.id]}
                      onClick={() => handleModerate(report.id, "APPROVE")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-xs font-bold text-success-foreground shadow-subtle transition hover:opacity-95 disabled:opacity-50"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>
                        {actionLoading[report.id]
                          ? "Memproses..."
                          : "Setujui & Publikasikan Blacklist"}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading[report.id]}
                      onClick={() => handleModerate(report.id, "REJECT")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-card px-4 py-2 text-xs font-bold text-destructive shadow-subtle transition hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>
                        {actionLoading[report.id] ? "Memproses..." : "Tolak & Arsipkan Laporan"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Already reviewed status */}
              {report.status !== "PENDING" && (
                <div className="border-t border-border/70 pt-3 text-xs">
                  {report.status === "APPROVED" && (
                    <div className="flex items-center gap-1.5 text-success font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Laporan telah disetujui dan aktif dalam pencarian publik.</span>
                    </div>
                  )}
                  {report.status === "REJECTED" && (
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-destructive">Laporan Ditolak:</span>{" "}
                      {report.rejectionReason || "Tidak ada catatan penolakan spesifik."}
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
