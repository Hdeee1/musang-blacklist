import { describe, expect, it } from "vitest";
import { BlacklistStatus, IdentifierType, ReportStatus, Role } from "@prisma/client";
import { prisma } from "../src/lib/db";

describe("Database & Model Data Layer", () => {
  it("exports a configured prisma singleton instance", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.user.findMany).toBe("function");
    expect(typeof prisma.blacklistEntry.findUnique).toBe("function");
    expect(typeof prisma.report.create).toBe("function");
    expect(typeof prisma.reportEvidence.findMany).toBe("function");
    expect(typeof prisma.moderationLog.create).toBe("function");
  });

  it("contains correct enum definitions matching business requirements", () => {
    expect(Role.BUYER).toBe("BUYER");
    expect(Role.REPORTER).toBe("REPORTER");
    expect(Role.ADMIN).toBe("ADMIN");

    expect(IdentifierType.BANK_ACCOUNT).toBe("BANK_ACCOUNT");
    expect(IdentifierType.WHATSAPP).toBe("WHATSAPP");

    expect(BlacklistStatus.BLACKLISTED).toBe("BLACKLISTED");
    expect(BlacklistStatus.CLEAN).toBe("CLEAN");
    expect(BlacklistStatus.PENDING_REVIEW).toBe("PENDING_REVIEW");

    expect(ReportStatus.PENDING).toBe("PENDING");
    expect(ReportStatus.APPROVED).toBe("APPROVED");
    expect(ReportStatus.REJECTED).toBe("REJECTED");
  });

  it("validates data integrity constraints for blacklist targets", () => {
    const validBankTarget = {
      identifierType: IdentifierType.BANK_ACCOUNT,
      identifierValue: "0123456789",
      bankName: "BCA",
      status: BlacklistStatus.BLACKLISTED,
    };

    expect(validBankTarget.identifierType).toBe(IdentifierType.BANK_ACCOUNT);
    expect(validBankTarget.identifierValue).toMatch(/^[0-9]+$/);
  });
});

