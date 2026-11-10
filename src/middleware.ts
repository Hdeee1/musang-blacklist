import { type NextRequest, NextResponse } from "next/server";
import { problemResponse } from "@/lib/api-response";
import { checkTierRateLimit, getClientIp } from "@/lib/rate-limit";
import { SECURITY_HEADERS, verifyOriginOrReferer } from "@/lib/security";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIp = getClientIp(request.headers);

  // 1. Rate Limiting for Public Search (API & SSR page)
  if (pathname === "/search" || pathname === "/api/search") {
    const rateLimit = checkTierRateLimit(clientIp, "SEARCH", "search");

    if (!rateLimit.allowed) {
      if (pathname.startsWith("/api/")) {
        return problemResponse(
          429,
          "Too Many Requests",
          "Batas frekuensi pencarian terlampaui. Silakan coba kembali beberapa saat lagi.",
          undefined,
          pathname,
          rateLimit.headers,
        );
      }

      return new NextResponse(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>429 - Terlalu Banyak Permintaan | Musang Blacklist</title>
  <style>
    body { font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif; background: #faf9f5; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; padding: 2.5rem; border-radius: 1rem; max-width: 460px; text-align: center; box-shadow: 0 4px 20px -8px rgba(0,0,0,0.1); }
    h1 { color: #e11d48; font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
    p { color: #64748b; font-size: 0.9rem; line-height: 1.5; margin-top: 0.75rem; }
    a { display: inline-block; margin-top: 1.5rem; color: #0d9488; text-decoration: none; font-weight: 600; font-size: 0.875rem; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>429 — Terlalu Banyak Permintaan</h1>
    <p>Batas frekuensi pencarian publik telah terlampaui. Demi keamanan dan stabilitas layanan, silakan coba beberapa saat lagi.</p>
    <a href="/">← Kembali ke Beranda</a>
  </div>
</body>
</html>`,
        {
          status: 429,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            ...rateLimit.headers,
            ...SECURITY_HEADERS,
          },
        },
      );
    }
  }

  // 2. CSRF / Origin Verification for mutating API requests
  if (pathname.startsWith("/api/")) {
    if (!verifyOriginOrReferer(request)) {
      return problemResponse(
        403,
        "Forbidden",
        "Permintaan ditolak karena asal permintaan (Origin) tidak valid.",
        undefined,
        pathname,
      );
    }
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = sessionCookie?.value ? await verifySessionToken(sessionCookie.value) : null;

  // 3. Protect Admin routes (/admin/**)
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "ADMIN") {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "unauthorized_role");
      return NextResponse.redirect(homeUrl);
    }
  }

  // 4. Protect Authenticated User routes (/report, /my-reports)
  if (pathname.startsWith("/report") || pathname.startsWith("/my-reports")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Redirect authenticated users away from /login and /register
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/report",
    "/my-reports",
    "/login",
    "/register",
    "/search",
    "/blacklist/:path*",
    "/api/:path*",
  ],
};
