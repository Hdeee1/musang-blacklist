import { type NextRequest } from "next/server";

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

/**
 * Validates request Origin / Referer for state-changing HTTP methods (POST, PUT, DELETE, PATCH).
 * Protects against Cross-Site Request Forgery (CSRF).
 */
export function verifyOriginOrReferer(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  // Safe idempotent methods do not need CSRF origin verification
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true;
  }

  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  // If neither Origin nor Referer is provided (e.g. non-browser API client/tests), allow it.
  if (!originHeader && !refererHeader) {
    return true;
  }

  const allowedOrigins = [
    request.nextUrl.origin,
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean) as string[];

  if (originHeader) {
    return allowedOrigins.some((allowed) => originHeader === allowed);
  }

  if (refererHeader) {
    try {
      const refererUrl = new URL(refererHeader);
      return allowedOrigins.some((allowed) => {
        try {
          const allowedUrl = new URL(allowed);
          return refererUrl.origin === allowedUrl.origin;
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  }

  return false;
}
