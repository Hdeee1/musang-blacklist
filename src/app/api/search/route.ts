import { type NextRequest, NextResponse } from "next/server";
import { problemResponse } from "@/lib/api-response";
import { checkTierRateLimit, getClientIp } from "@/lib/rate-limit";
import { searchBlacklistEntries } from "@/lib/search";

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkTierRateLimit(clientIp, "SEARCH", "search");

    if (!rateLimit.allowed) {
      return problemResponse(
        429,
        "Too Many Requests",
        "Batas frekuensi pencarian terlampaui. Silakan coba kembali beberapa saat lagi.",
        undefined,
        "/api/search",
        rateLimit.headers,
      );
    }

    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q") || searchParams.get("query");

    if (!query || query.trim().length < 5) {
      return problemResponse(
        400,
        "Bad Request",
        "Kata kunci pencarian minimal 5 karakter (nomor rekening atau nomor WhatsApp).",
        { q: ["Minimal 5 karakter"] },
        "/api/search",
        rateLimit.headers,
      );
    }

    const result = await searchBlacklistEntries(query);

    return NextResponse.json(
      {
        query: result.query,
        found: result.found,
        total: result.total,
        entries: result.entries.map((entry) => ({
          id: entry.id,
          identifierType: entry.identifierType,
          identifierValue: entry.identifierValue,
          bankName: entry.bankName,
          status: entry.status,
          totalReports: entry.totalReports,
          lastReportedAt: entry.lastReportedAt,
          reports: entry.reports.map((rep) => ({
            id: rep.id,
            chronology: rep.chronology,
            createdAt: rep.createdAt,
            evidenceCount: rep.evidences.length,
            evidences: rep.evidences,
          })),
        })),
      },
      {
        status: 200,
        headers: rateLimit.headers,
      },
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return problemResponse(500, "Internal Server Error", detail, undefined, "/api/search");
  }
}
