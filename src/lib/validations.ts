import { z } from "zod";

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export const MAX_EVIDENCE_FILES = 3;
export const MIN_EVIDENCE_FILES = 1;
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(5, "Query must be at least 5 characters")
    .max(30, "Query cannot exceed 30 characters")
    .regex(/^[0-9+]+$/, "Query must only contain numbers and optional leading +"),
  type: z.enum(["bank_account", "whatsapp"]),
});

export type SearchInput = z.infer<typeof searchSchema>;

export const registerSchema = z.object({
  email: z.string().trim().email("Format email tidak valid").toLowerCase(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid").toLowerCase(),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const reportInputSchema = z.object({
  identifierType: z.enum(["bank_account", "whatsapp"], {
    errorMap: () => ({ message: "Tipe target harus 'bank_account' atau 'whatsapp'" }),
  }),
  identifierValue: z
    .string()
    .trim()
    .min(5, "Nomor minimal 5 karakter")
    .max(30, "Nomor maksimal 30 karakter")
    .regex(/^[0-9+]+$/, "Nomor hanya boleh berisi angka dan tanda plus (+) di awal"),
  bankName: z
    .string()
    .trim()
    .min(2, "Nama bank minimal 2 karakter")
    .max(50, "Nama bank maksimal 50 karakter")
    .optional()
    .or(z.literal("")),
  chronology: z
    .string()
    .trim()
    .min(20, "Kronologi kejadian minimal 20 karakter agar jelas dan dapat dievaluasi")
    .max(2000, "Kronologi kejadian maksimal 2000 karakter"),
});

export type ReportInput = z.infer<typeof reportInputSchema>;

export const reportSubmissionSchema = reportInputSchema.extend({
  evidenceUrls: z
    .array(z.string().url("URL bukti tidak valid"))
    .min(MIN_EVIDENCE_FILES, `Wajib mengunggah minimal ${MIN_EVIDENCE_FILES} bukti tangkapan layar`)
    .max(MAX_EVIDENCE_FILES, `Maksimal ${MAX_EVIDENCE_FILES} bukti tangkapan layar`),
});

export type ReportSubmissionInput = z.infer<typeof reportSubmissionSchema>;

export function validateEvidenceFile(file: { name: string; size: number; type: string }): {
  valid: boolean;
  error?: string;
} {
  const lowerName = file.name.toLowerCase();
  const forbiddenTerms = ["ktp", "kk", "sim", "selfie", "wajah", "paspor", "kartukeluarga"];

  // Tokenize by non-alphanumeric characters (e.g. underscores, hyphens, dots, spaces)
  const tokens = lowerName.split(/[^a-z0-9]+/);
  const compactName = lowerName.replace(/[^a-z0-9]/g, "");

  const containsForbidden =
    forbiddenTerms.some((term) => tokens.includes(term)) || compactName.includes("kartukeluarga");

  if (containsForbidden) {
    return {
      valid: false,
      error:
        "Pelanggaran Privasi: Dilarang mengunggah identitas kependudukan (KTP, KK, SIM) atau foto wajah/selfie.",
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: `Format file ${file.name} tidak didukung. Format yang diizinkan: JPG, PNG, WebP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Ukuran file ${file.name} melebihi batas 2MB (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `File ${file.name} kosong (0 byte).`,
    };
  }

  return { valid: true };
}
