import { describe, expect, it } from "vitest";
import { saveEvidenceFile } from "../src/lib/storage";
import {
  MAX_FILE_SIZE_BYTES,
  reportInputSchema,
  reportSubmissionSchema,
  validateEvidenceFile,
} from "../src/lib/validations";

describe("Reporting & Evidence Upload Module", () => {
  describe("Evidence File Validation", () => {
    it("accepts valid image file under 2MB", () => {
      const validFile = {
        name: "bukti_transfer_bca.jpg",
        size: 500 * 1024, // 500KB
        type: "image/jpeg",
      };

      const result = validateEvidenceFile(validFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rejects file exceeding 2MB limit", () => {
      const oversizedFile = {
        name: "large_evidence.png",
        size: MAX_FILE_SIZE_BYTES + 1024,
        type: "image/png",
      };

      const result = validateEvidenceFile(oversizedFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("melebihi batas 2MB");
    });

    it("rejects file with unsupported MIME types", () => {
      const pdfFile = {
        name: "evidence.pdf",
        size: 100 * 1024,
        type: "application/pdf",
      };

      const result = validateEvidenceFile(pdfFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("tidak didukung");
    });

    it("strictly blocks privacy violations (KTP, KK, SIM, Selfie/Wajah)", () => {
      const forbiddenFiles = [
        { name: "foto_ktp_penipu.jpg", size: 100 * 1024, type: "image/jpeg" },
        { name: "kartu_keluarga_terduga.png", size: 100 * 1024, type: "image/png" },
        { name: "foto_sim_a.jpg", size: 100 * 1024, type: "image/jpeg" },
        { name: "selfie_penjual.webp", size: 100 * 1024, type: "image/webp" },
        { name: "wajah_pelaku.jpg", size: 100 * 1024, type: "image/jpeg" },
      ];

      for (const file of forbiddenFiles) {
        const result = validateEvidenceFile(file);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Pelanggaran Privasi");
      }
    });

    it("rejects 0-byte empty file", () => {
      const emptyFile = {
        name: "empty.jpg",
        size: 0,
        type: "image/jpeg",
      };

      const result = validateEvidenceFile(emptyFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("kosong");
    });
  });

  describe("Report Input Validation", () => {
    it("validates valid bank account report input", () => {
      const valid = reportInputSchema.safeParse({
        identifierType: "bank_account",
        identifierValue: "1234567890",
        bankName: "BCA",
        chronology: "Pelaku menawarkan laptop murah dan setelah ditransfer langsung kabur.",
      });

      expect(valid.success).toBe(true);
    });

    it("validates valid WhatsApp report input", () => {
      const valid = reportInputSchema.safeParse({
        identifierType: "whatsapp",
        identifierValue: "+628123456789",
        chronology: "Pelaku mengaku admin rekber resmi dan memblokir kontak setelah dana masuk.",
      });

      expect(valid.success).toBe(true);
    });

    it("rejects chronology under 20 characters", () => {
      const invalid = reportInputSchema.safeParse({
        identifierType: "whatsapp",
        identifierValue: "+628123456789",
        chronology: "Penipu kabur.",
      });

      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.errors[0]?.message).toContain("minimal 20 karakter");
      }
    });

    it("enforces evidence count limits (1 to 3 files)", () => {
      const noEvidence = reportSubmissionSchema.safeParse({
        identifierType: "bank_account",
        identifierValue: "1234567890",
        chronology: "Pelaku menawarkan laptop murah dan setelah ditransfer langsung kabur.",
        evidenceUrls: [],
      });
      expect(noEvidence.success).toBe(false);

      const fourEvidences = reportSubmissionSchema.safeParse({
        identifierType: "bank_account",
        identifierValue: "1234567890",
        chronology: "Pelaku menawarkan laptop murah dan setelah ditransfer langsung kabur.",
        evidenceUrls: [
          "https://example.com/1.jpg",
          "https://example.com/2.jpg",
          "https://example.com/3.jpg",
          "https://example.com/4.jpg",
        ],
      });
      expect(fourEvidences.success).toBe(false);

      const validEvidences = reportSubmissionSchema.safeParse({
        identifierType: "bank_account",
        identifierValue: "1234567890",
        chronology: "Pelaku menawarkan laptop murah dan setelah ditransfer langsung kabur.",
        evidenceUrls: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
      });
      expect(validEvidences.success).toBe(true);
    });
  });

  describe("File Storage", () => {
    it("saves valid mock file successfully to disk", async () => {
      const mockFile = new File(["mock-image-content-bytes"], "bukti_chat_wa.png", {
        type: "image/png",
      });

      const stored = await saveEvidenceFile(mockFile);
      expect(stored.url).toMatch(/^\/uploads\/evidence\/[a-f0-9-]+\.png$/);
      expect(stored.mimeType).toBe("image/png");
      expect(stored.size).toBe(mockFile.size);
    });

    it("throws error when trying to save an invalid or forbidden file", async () => {
      const invalidFile = new File(["dummy"], "scan_ktp_saya.jpg", {
        type: "image/jpeg",
      });

      await expect(saveEvidenceFile(invalidFile)).rejects.toThrow("Pelanggaran Privasi");
    });
  });
});
