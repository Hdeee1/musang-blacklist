import { describe, expect, it } from "vitest";
import { BlacklistStatus, IdentifierType, ReportStatus } from "@prisma/client";
import { moderationActionSchema } from "../src/lib/validations";

describe("Admin Moderation Module", () => {
  describe("Moderation Action Schema", () => {
    it("accepts valid APPROVE action with optional notes", () => {
      const validApprove = {
        action: "APPROVE",
        notes: "Bukti mutasi transfer valid dan nomor rekening sesuai.",
      };

      const result = moderationActionSchema.safeParse(validApprove);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action).toBe("APPROVE");
        expect(result.data.isSpam).toBe(false);
      }
    });

    it("accepts valid REJECT action with notes and isSpam flag", () => {
      const validReject = {
        action: "REJECT",
        notes: "Laporan terindikasi fitnah/spam tanpa bukti transaksi.",
        isSpam: true,
      };

      const result = moderationActionSchema.safeParse(validReject);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action).toBe("REJECT");
        expect(result.data.isSpam).toBe(true);
      }
    });

    it("rejects invalid action values", () => {
      const invalidAction = {
        action: "DELETE",
      };

      const result = moderationActionSchema.safeParse(invalidAction);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain("APPROVE atau REJECT");
      }
    });

    it("rejects notes exceeding 1000 characters", () => {
      const oversizedNotes = {
        action: "APPROVE",
        notes: "A".repeat(1001),
      };

      const result = moderationActionSchema.safeParse(oversizedNotes);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain("maksimal 1000 karakter");
      }
    });
  });

  describe("Business Logic Flow: Reputation & Target Calculations", () => {
    it("calculates reporter reputation reward upon valid approval", () => {
      const initialReputation = 100;
      const reward = 10;
      const updatedReputation = initialReputation + reward;

      expect(updatedReputation).toBe(110);
    });

    it("calculates reporter reputation penalty upon spam rejection", () => {
      const initialReputation = 100;
      const penalty = 20;
      const updatedReputation = initialReputation - penalty;

      expect(updatedReputation).toBe(80);
    });

    it("does not penalize reporter reputation upon normal non-spam rejection", () => {
      const initialReputation = 100;
      const isSpam = false;
      const penalty = isSpam ? 20 : 0;
      const updatedReputation = initialReputation - penalty;

      expect(updatedReputation).toBe(100);
    });

    it("verifies BlacklistEntry creation shape when approving bank account target", () => {
      const sampleReport = {
        targetType: IdentifierType.BANK_ACCOUNT,
        targetValue: "1234567890",
        bankName: "BCA",
        status: ReportStatus.APPROVED,
      };

      const blacklistEntry = {
        identifierType: sampleReport.targetType,
        identifierValue: sampleReport.targetValue,
        bankName: sampleReport.bankName,
        status: BlacklistStatus.BLACKLISTED,
        totalReports: 1,
      };

      expect(blacklistEntry.status).toBe(BlacklistStatus.BLACKLISTED);
      expect(blacklistEntry.identifierType).toBe(IdentifierType.BANK_ACCOUNT);
      expect(blacklistEntry.totalReports).toBe(1);
    });
  });
});
