"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileImage, Trash2, UploadCloud } from "lucide-react";
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
      setErrorMessage(`Maksimal ${MAX_EVIDENCE_FILES} bukti file yang dapat diunggah.`);
      return;
    }

    for (const file of newFiles) {
      const validation = validateEvidenceFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!validation.valid) {
        setErrorMessage(validation.error || "File tidak memenuhi syarat.");
        return;
      }
    }

    setFiles(combinedFiles);
    // Reset file input value so re-selecting works
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
        `Wajib melampirkan minimal ${MIN_EVIDENCE_FILES} tangkapan layar bukti transaksi.`,
      );
      return;
    }

    if (chronology.trim().length < 20) {
      setErrorMessage("Kronologi kejadian minimal 20 karakter agar jelas dan dapat dievaluasi.");
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
          data.detail || "Gagal mengirimkan laporan. Silakan periksa kembali formulir.",
        );
        return;
      }

      setSuccessMessage(
        "Laporan berhasil dikirim! Laporan Anda telah masuk antrean moderasi dan akan diverifikasi oleh admin sebelum tampil di pencarian publik.",
      );
      // Reset form
      setIdentifierValue("");
      setBankName("");
      setChronology("");
      setFiles([]);
    } catch {
      setErrorMessage("Terjadi gangguan koneksi saat mengirimkan laporan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Buat Laporan Penipuan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Laporkan nomor rekening bank atau nomor WhatsApp terindikasi penipuan dengan bukti
          transaksi nyata.
        </p>
      </div>

      {/* Privacy Notice Box */}
      <div
        role="alert"
        className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-warning-foreground shadow-soft"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning mt-0.5" />
          <div className="text-xs leading-relaxed sm:text-sm">
            <strong className="font-bold block mb-0.5 text-foreground">
              PERINGATAN PRIVASI (KEBIJAKAN KETAT):
            </strong>
            Dilarang mengunggah identitas kependudukan sensitif (<strong>KTP, KK, SIM</strong>) atau
            foto wajah/selfie orang lain. Laporan wajib murni berfokus pada{" "}
            <strong>bukti transaksi finansial nyata</strong> (bukti transfer bank, struk
            ATM/m-banking, dan tangkapan layar percakapan).
          </div>
        </div>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mb-6 rounded-2xl border border-success/30 bg-success/10 p-5 text-foreground shadow-soft"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-success">Sukses Mengirim Laporan</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{successMessage}</p>
              <div className="mt-3 flex gap-3">
                <Link
                  href="/my-reports"
                  className="rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition"
                >
                  Lihat Riwayat Laporan Saya
                </Link>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition"
                >
                  Kirim Laporan Lain
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive shadow-soft"
        >
          <p className="text-sm font-bold">Gagal Mengirim Laporan</p>
          <p className="mt-1 text-xs sm:text-sm">{errorMessage}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
      >
        {/* Identifier Type */}
        <div>
          <label className="block text-sm font-bold text-foreground">Kategori Data Penipu</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIdentifierType("bank_account")}
              className={`flex items-center justify-center rounded-xl border p-3 text-sm font-semibold transition ${
                identifierType === "bank_account"
                  ? "border-primary bg-primary/10 text-primary shadow-soft"
                  : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Nomor Rekening Bank
            </button>
            <button
              type="button"
              onClick={() => setIdentifierType("whatsapp")}
              className={`flex items-center justify-center rounded-xl border p-3 text-sm font-semibold transition ${
                identifierType === "whatsapp"
                  ? "border-primary bg-primary/10 text-primary shadow-soft"
                  : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Nomor WhatsApp
            </button>
          </div>
        </div>

        {/* Bank Name (conditional) */}
        {identifierType === "bank_account" && (
          <div>
            <label htmlFor="bank-name" className="block text-sm font-medium text-foreground">
              Nama Bank
            </label>
            <input
              id="bank-name"
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Contoh: BCA, BRI, Mandiri, BNI, Seabank, Jago..."
              className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {/* Identifier Value */}
        <div>
          <label htmlFor="identifier-value" className="block text-sm font-medium text-foreground">
            {identifierType === "bank_account" ? "Nomor Rekening Penipu" : "Nomor WhatsApp Penipu"}
          </label>
          <input
            id="identifier-value"
            type="text"
            required
            value={identifierValue}
            onChange={(e) => setIdentifierValue(e.target.value)}
            placeholder={
              identifierType === "bank_account"
                ? "Contoh: 1234567890"
                : "Contoh: 08123456789 atau +628123456789"
            }
            className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Chronology */}
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="chronology" className="block text-sm font-medium text-foreground">
              Kronologi Kejadian Singkat
            </label>
            <span
              className={`text-xs ${
                chronology.length < 20 ? "text-warning" : "text-muted-foreground"
              }`}
            >
              {chronology.length}/2000 karakter (min. 20)
            </span>
          </div>
          <textarea
            id="chronology"
            required
            rows={4}
            value={chronology}
            onChange={(e) => setChronology(e.target.value)}
            placeholder="Jelaskan secara ringkas transaksi yang dilakukan, barang/jasa yang dijanjikan, dan bagaimana penipuan terjadi..."
            className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Evidence File Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground">
            Unggah Bukti Transaksi (Wajib 1 - 3 Berkas)
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Format: JPG, PNG, atau WebP. Maksimal 2MB per file.
          </p>

          <div className="mt-3">
            {files.length < MAX_EVIDENCE_FILES && (
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-secondary/30 p-6 text-center transition hover:border-primary hover:bg-secondary/60"
              >
                <UploadCloud className="h-8 w-8 text-primary" />
                <span className="mt-2 text-sm font-semibold text-foreground">
                  Pilih atau seret gambar bukti ke sini
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  Screenshot bukti transfer / mutasi rekening & chat transaksi
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

            {/* Selected File Previews */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  File terpilih ({files.length}/{MAX_EVIDENCE_FILES}):
                </p>
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3.5 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileImage className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium text-foreground">{file.name}</span>
                      <span className="text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-destructive hover:opacity-80 transition"
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

        <button
          type="submit"
          disabled={loading || files.length < MIN_EVIDENCE_FILES}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Mengirim Laporan..." : "Kirim Laporan"}
        </button>
      </form>
    </div>
  );
}
