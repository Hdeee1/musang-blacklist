import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { SECURITY_HEADERS, verifyOriginOrReferer } from "@/lib/security";

describe("Security & CSRF Protection", () => {
  describe("SECURITY_HEADERS", () => {
    it("should define standard defensive headers", () => {
      expect(SECURITY_HEADERS["X-Content-Type-Options"]).toBe("nosniff");
      expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
      expect(SECURITY_HEADERS["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
      expect(SECURITY_HEADERS["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    });
  });

  describe("verifyOriginOrReferer", () => {
    it("should allow safe HTTP methods regardless of origin header", () => {
      const getReq = new NextRequest("http://localhost:3000/api/search?q=12345", {
        method: "GET",
        headers: {
          origin: "https://evil-attacker.com",
        },
      });

      expect(verifyOriginOrReferer(getReq)).toBe(true);
    });

    it("should allow state-changing methods if Origin matches application host", () => {
      const postReq = new NextRequest("http://localhost:3000/api/reports", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
        },
      });

      expect(verifyOriginOrReferer(postReq)).toBe(true);
    });

    it("should allow state-changing methods if Referer origin matches application host", () => {
      const postReq = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          referer: "http://localhost:3000/login",
        },
      });

      expect(verifyOriginOrReferer(postReq)).toBe(true);
    });

    it("should reject state-changing methods if Origin is from an untrusted external domain", () => {
      const evilPostReq = new NextRequest("http://localhost:3000/api/reports", {
        method: "POST",
        headers: {
          origin: "https://phishing-site.example.org",
        },
      });

      expect(verifyOriginOrReferer(evilPostReq)).toBe(false);
    });

    it("should reject state-changing methods if Referer is from an untrusted external domain", () => {
      const evilPostReq = new NextRequest("http://localhost:3000/api/admin/reports/123/moderate", {
        method: "POST",
        headers: {
          referer: "https://phishing-site.example.org/fake-form",
        },
      });

      expect(verifyOriginOrReferer(evilPostReq)).toBe(false);
    });

    it("should allow non-browser clients when neither Origin nor Referer is sent", () => {
      const apiReq = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
      });

      expect(verifyOriginOrReferer(apiReq)).toBe(true);
    });
  });
});
