import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import {
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from "../src/lib/auth";
import { loginSchema, registerSchema } from "../src/lib/validations";

describe("Authentication & Authorization Module", () => {
  describe("Password Hashing", () => {
    it("hashes passwords securely with bcrypt", async () => {
      const password = "SuperSecretPassword123!";
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword("WrongPassword123!", hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe("JWT Session Tokens", () => {
    it("signs and verifies valid session tokens", async () => {
      const payload = {
        userId: "user_test_123",
        email: "test@musang.local",
        role: Role.REPORTER,
      };

      const token = await createSessionToken(payload);
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);

      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
      expect(verified?.role).toBe(Role.REPORTER);
    });

    it("returns null for malformed or tampered tokens", async () => {
      const verifiedMalformed = await verifySessionToken("invalid.jwt.token");
      expect(verifiedMalformed).toBeNull();

      const validToken = await createSessionToken({
        userId: "user_test_456",
        email: "admin@musang.local",
        role: Role.ADMIN,
      });

      // Tamper with the token body
      const parts = validToken.split(".");
      const tampered = `${parts[0]}.eyJob2dlIjoidGFtcGVyZWQifQ.${parts[2]}`;
      const verifiedTampered = await verifySessionToken(tampered);
      expect(verifiedTampered).toBeNull();
    });
  });

  describe("Auth Boundary Validation", () => {
    it("accepts valid registration payload", () => {
      const valid = registerSchema.safeParse({
        email: "user@example.com",
        password: "ValidPassword123",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects password shorter than 8 characters", () => {
      const invalid = registerSchema.safeParse({
        email: "user@example.com",
        password: "short",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects invalid email formats", () => {
      const invalid = registerSchema.safeParse({
        email: "not-an-email",
        password: "ValidPassword123",
      });
      expect(invalid.success).toBe(false);
    });

    it("validates login payload requirements", () => {
      const valid = loginSchema.safeParse({
        email: "user@example.com",
        password: "anyPassword",
      });
      expect(valid.success).toBe(true);

      const invalid = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(invalid.success).toBe(false);
    });
  });
});

