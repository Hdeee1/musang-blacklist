"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileImage,
  Lock,
  MessageSquare,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { MAX_EVIDENCE_FILES, MIN_EVIDENCE_FILES, validateEvidenceFile } from "@/lib/validations";

export default function ReportPage() {
  const [identifierType, setIdentifierType] = useState<"bank_account" | "whatsapp">("bank_account");
  const [identifierValue, setIdentifierValue] = useState("");
  const [bankName, setBankName] = useState("");
  const [chronology, setChronology] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const combinedFiles = [...files, ...newFiles];

    if (combinedFiles.length > MAX_EVIDENCE_FILES) {
      setErrorMessage(`Maksimal ${MAX_EVIDENCE_FILES} berkas bukti yang dapat diunggah.`);
      return;
    }

    for (const file of newFiles) {
      const validation = validateEvidenceFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!validation.valid) {
        setErrorMessage(validation.error || "Berkas tidak memenuhi syarat.");
        return;
      }
    }

    setFiles(combinedFiles);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (files.length < MIN_EVIDENCE_FILES) {
      setErrorMessage(
        `Wajib melampirkan minimal ${MIN_EVIDENCE_FILES} berkas bukti transfer atau percakapan transaksi.`,
      );
      return;
    }

    if (chronology.trim().length < 20) {
      setErrorMessage(
        "Kronologi kejadian minimal 20 karakter agar kronologi dapat dipahami jelas oleh kurator.",
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("identifierType", identifierType);
      formData.append("identifierValue", identifierValue.trim());
      if (identifierType === "bank_account" && bankName.trim()) {
        formData.append("bankName", bankName.trim());
      }
      formData.append("chronology", chronology.trim());

      files.forEach((file) => {
        formData.append("evidence", file);
      });

      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.detail || "Gagal mengirimkan laporan. Silakan periksa kembali data formulir.",
        );
        return;
      }

      setSuccessMessage(
        "Laporan Anda telah berhasil diajukan! Berkas masuk ke antrean kurasi dan akan ditinjau oleh tim moderator sebelum dipublikasikan.",
      );
      setIdentifierValue("");
      setBankName("");
      setChronology("");
      setFiles([]);
    } catch {
      setErrorMessage("Terjadi gangguan koneksi jaringan saat mengirimkan laporan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Formulir Pelaporan Penipuan
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Laporkan nomor rekening bank atau nomor WhatsApp penipu dengan melampirkan bukti transfer
          dan bukti percakapan jual beli riil.
        </p>
      </div>

      {/* Strict Privacy Shield Box */}
      <div
        role="alert"
        className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-warning-foreground shadow-subtle space-y-2"
      >
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <strong className="text-foreground font-bold block">
              Kebijakan Privasi & Anti-Doxxing (Wajib Dipatuhi):
            </strong>
            <p className="text-muted-foreground">
              Musang Blacklist <strong>menolak keras</strong> pengunggahan foto identitas pribadi
              (KTP, KK, SIM) maupun foto wajah/selfie orang lain. Laporan wajib berfokus murni pada
              bukti finansial:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5 pt-1">
              <li>Tangkapan layar mutasi / m-banking / struk transfer ATM</li>
              <li>Tangkapan layar bukti percakapan transaksi jual beli</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-success/40 bg-success/10 p-5 text-foreground shadow-subtle space-y-3"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-success text-sm">Laporan Berhasil Diajukan</p>
              <p className="text-xs text-muted-foreground">{successMessage}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 pl-8">
            <Link
              href="/my-reports"
              className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-subtle transition hover:opacity-95"
            >
              Lihat Riwayat Laporan Saya
            </Link>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
            >
              Kirim Laporan Baru
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive shadow-subtle"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-bold block">Gagal Mengirim Laporan:</strong>
              <p className="mt-0.5 text-destructive-foreground">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-6"
      >
        {/* Identifier Type Switcher */}
        <div>
          <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
            Pilih Kategori Identitas
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIdentifierType("bank_account")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs sm:text-sm font-semibold transition ${
                identifierType === "bank_account"
                  ? "border-primary bg-primary/10 text-primary shadow-subtle"
                  : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Nomor Rekening Bank</span>
            </button>

            <button
              type="button"
              onClick={() => setIdentifierType("whatsapp")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs sm:text-sm font-semibold transition ${
                identifierType === "whatsapp"
                  ? "border-primary bg-primary/10 text-primary shadow-subtle"
                  : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Nomor WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Bank Name (conditional) */}
        {identifierType === "bank_account" && (
          <div>
            <label
              htmlFor="bank-name"
              className="block text-xs font-bold text-foreground uppercase tracking-wider"
            >
              Nama Bank Penipu
            </label>
            <input
              id="bank-name"
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Contoh: BCA, BRI, Mandiri, BNI, Seabank, Bank Jago..."
              className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {/* Identifier Value */}
        <div>
          <label
            htmlFor="identifier-value"
            className="block text-xs font-bold text-foreground uppercase tracking-wider"
          >
            {identifierType === "bank_account" ? "Nomor Rekening Bank" : "Nomor WhatsApp Pelaku"}
          </label>
          <input
            id="identifier-value"
            type="text"
            required
            value={identifierValue}
            onChange={(e) => setIdentifierValue(e.target.value)}
            placeholder={
              identifierType === "bank_account"
                ? "Masukkan digit rekening (misal: 1234567890)"
                : "Masukkan nomor kontak (misal: 08123456789 atau +62812...)"
            }
            className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-mono text-foreground outline-none placeholder:text-muted-foreground placeholder:font-sans focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {identifierType === "bank_account"
              ? "Pastikan nomor rekening sesuai dengan tujuan transfer pada bukti slip."
              : "Bisa format 08xx maupun +62xx, sistem akan menormalisasi secara otomatis."}
          </p>
        </div>

        {/* Chronology */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="chronology"
              className="block text-xs font-bold text-foreground uppercase tracking-wider"
            >
              Kronologi Kejadian Transaksi
            </label>
            <span
              className={`text-[11px] font-mono ${
                chronology.length < 20 ? "text-warning font-semibold" : "text-muted-foreground"
              }`}
            >
              {chronology.length} / 2000 (min. 20)
            </span>
          </div>
          <textarea
            id="chronology"
            required
            rows={4}
            value={chronology}
            onChange={(e) => setChronology(e.target.value)}
            placeholder="Jelaskan secara ringkas: apa barang/jasa yang ditransaksikan, nominal kerugian, kapan transfer dilakukan, dan bagaimana penjual memutus kontak..."
            className="block w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
          />
        </div>

        {/* Evidence Upload */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
              Unggah Bukti Transfer & Chat ({MIN_EVIDENCE_FILES} - {MAX_EVIDENCE_FILES} Berkas)
            </label>
            <span className="text-[11px] text-muted-foreground font-mono">
              {files.length}/{MAX_EVIDENCE_FILES} Berkas
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Format yang didukung: JPG, PNG, atau WebP. Maksimal 2MB per file.
          </p>

          <div className="mt-3 space-y-3">
            {files.length < MAX_EVIDENCE_FILES && (
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 text-center transition hover:border-primary hover:bg-secondary/60"
              >
                <UploadCloud className="h-7 w-7 text-primary mb-2" />
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  Klik untuk memilih atau seret gambar bukti ke sini
                </span>
                <span className="mt-1 text-[11px] text-muted-foreground">
                  Screenshot bukti mutasi / slip m-banking dan percakapan transaksi
                </span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Uploaded File Previews */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3.5 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileImage className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium text-foreground">{file.name}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-destructive hover:opacity-80 p-1 transition"
                      aria-label={`Hapus file ${file.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || files.length < MIN_EVIDENCE_FILES}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-subtle transition hover:opacity-95 disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{loading ? "Mengirimkan Laporan..." : "Kirim Laporan ke Antrean Kurasi"}</span>
        </button>
      </form>
    </div>
  );
}
