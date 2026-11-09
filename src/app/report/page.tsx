"use client";

import { useState } from "react";
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
          Buat Laporan Penipuan
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Laporkan nomor rekening bank atau nomor WhatsApp terindikasi penipuan dengan bukti
          transaksi nyata.
        </p>
      </div>

      {/* Privacy Notice Box */}
      <div
        role="alert"
        className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-xs leading-relaxed sm:text-sm">
            <strong className="font-semibold block mb-0.5">
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
          className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="text-sm">
              <p className="font-semibold">Sukses Mengirim Laporan</p>
              <p className="mt-1 text-xs sm:text-sm">{successMessage}</p>
              <div className="mt-3 flex gap-3">
                <a
                  href="/my-reports"
                  className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                >
                  Lihat Riwayat Laporan Saya
                </a>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-medium hover:bg-emerald-100 dark:border-emerald-800 dark:hover:bg-emerald-900"
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
          className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
        >
          <p className="text-sm font-semibold">Gagal Mengirim Laporan</p>
          <p className="mt-1 text-xs sm:text-sm">{errorMessage}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Identifier Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Kategori Data Penipu
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIdentifierType("bank_account")}
              className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium transition ${
                identifierType === "bank_account"
                  ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              Nomor Rekening Bank
            </button>
            <button
              type="button"
              onClick={() => setIdentifierType("whatsapp")}
              className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium transition ${
                identifierType === "whatsapp"
                  ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              Nomor WhatsApp
            </button>
          </div>
        </div>

        {/* Bank Name (conditional) */}
        {identifierType === "bank_account" && (
          <div>
            <label
              htmlFor="bank-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nama Bank
            </label>
            <input
              id="bank-name"
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Contoh: BCA, BRI, Mandiri, BNI, Seabank, Jago..."
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        )}

        {/* Identifier Value */}
        <div>
          <label
            htmlFor="identifier-value"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
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
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Chronology */}
        <div>
          <div className="flex justify-between">
            <label
              htmlFor="chronology"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Kronologi Kejadian Singkat
            </label>
            <span
              className={`text-xs ${
                chronology.length < 20 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
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
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Evidence File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Unggah Bukti Transaksi (Wajib 1 - 3 Berkas)
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Format: JPG, PNG, atau WebP. Maksimal 2MB per file.
          </p>

          <div className="mt-3">
            {files.length < MAX_EVIDENCE_FILES && (
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-5 text-center transition hover:border-red-500 dark:border-slate-700 dark:hover:border-red-500"
              >
                <UploadCloud className="h-8 w-8 text-slate-400" />
                <span className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Pilih atau seret gambar bukti ke sini
                </span>
                <span className="mt-1 text-xs text-slate-500">
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
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  File terpilih ({files.length}/{MAX_EVIDENCE_FILES}):
                </p>
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileImage className="h-4 w-4 flex-shrink-0 text-slate-500" />
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {file.name}
                      </span>
                      <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-red-500 hover:text-red-700"
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
          className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Mengirim Laporan..." : "Kirim Laporan"}
        </button>
      </form>
    </div>
  );
}
