import { describe, expect, it } from "vitest";
import { reportSubmissionSchema, searchSchema } from "../src/lib/validations";

describe("Smoke Test - Musang Blacklist Core", () => {
  it("validates valid search queries", () => {
    const validBankQuery = {
      query: "1234567890",
      type: "bank_account",
    };
    const parsed = searchSchema.safeParse(validBankQuery);
    expect(parsed.success).toBe(true);
  });

  it("rejects search queries containing non-numeric characters", () => {
    const invalidQuery = {
      query: "scammer-account",
      type: "bank_account",
    };
    const parsed = searchSchema.safeParse(invalidQuery);
    expect(parsed.success).toBe(false);
  });

  it("validates report submission schema requirements", () => {
    const validReport = {
      identifierType: "whatsapp",
      identifierValue: "+628123456789",
      chronology: "Pelaku menawarkan barang elektronik murah kemudian memblokir kontak.",
      evidenceUrls: ["https://example.com/evidence1.jpg"],
    };
    const parsed = reportSubmissionSchema.safeParse(validReport);
    expect(parsed.success).toBe(true);
  });

  it("rejects reports with zero evidence screenshots", () => {
    const invalidReport = {
      identifierType: "whatsapp",
      identifierValue: "+628123456789",
      chronology: "Pelaku menawarkan barang elektronik murah kemudian memblokir kontak.",
      evidenceUrls: [],
    };
    const parsed = reportSubmissionSchema.safeParse(invalidReport);
    expect(parsed.success).toBe(false);
  });
});
