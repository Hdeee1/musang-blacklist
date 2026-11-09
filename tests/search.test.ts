import { describe, expect, it } from "vitest";
import { normalizeSearchQuery } from "../src/lib/search";
import { searchSchema } from "../src/lib/validations";

describe("Public Search & Detail Module", () => {
  describe("Search Query Normalization", () => {
    it("strips dashes, whitespace, and formatting symbols", () => {
      const normalized = normalizeSearchQuery(" 0812-3456-7890 ");
      expect(normalized.sanitized).toBe("081234567890");
    });

    it("generates international variants for Indonesian local phone numbers", () => {
      const normalized = normalizeSearchQuery("081234567890");
      expect(normalized.sanitized).toBe("081234567890");
      expect(normalized.variants).toContain("+6281234567890");
      expect(normalized.variants).toContain("6281234567890");
    });

    it("generates local variants for Indonesian international phone numbers", () => {
      const normalized = normalizeSearchQuery("+6281234567890");
      expect(normalized.sanitized).toBe("+6281234567890");
      expect(normalized.variants).toContain("081234567890");
    });

    it("normalizes bank account numbers correctly without altering digits", () => {
      const normalized = normalizeSearchQuery(" 123 456 7890 ");
      expect(normalized.sanitized).toBe("1234567890");
      expect(normalized.variants.length).toBe(0);
    });
  });

  describe("Search Validation Boundary", () => {
    it("accepts valid bank account query", () => {
      const result = searchSchema.safeParse({
        query: "1234567890",
        type: "bank_account",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid WhatsApp number with leading plus", () => {
      const result = searchSchema.safeParse({
        query: "+6281234567890",
        type: "whatsapp",
      });
      expect(result.success).toBe(true);
    });

    it("rejects query with characters shorter than 5", () => {
      const result = searchSchema.safeParse({
        query: "123",
        type: "bank_account",
      });
      expect(result.success).toBe(false);
    });

    it("rejects query with special characters other than plus", () => {
      const result = searchSchema.safeParse({
        query: "scammer@123",
        type: "bank_account",
      });
      expect(result.success).toBe(false);
    });
  });
});
