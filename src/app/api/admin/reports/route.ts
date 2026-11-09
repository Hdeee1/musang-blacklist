import { ReportStatus, Role } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { problemResponse } from "@/lib/api-response";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return problemResponse(
        401,
        "Unauthorized",
        "Sesi login tidak ditemukan atau kedaluwarsa.",
        undefined,
        "/api/admin/reports",
      );
    }

    if (session.role !== Role.ADMIN) {
      return problemResponse(
        403,
        "Forbidden",
        "Akses ditolak. Fitur ini hanya dapat diakses oleh Administrator.",
        undefined,
        "/api/admin/reports",
      );
    }

    const { searchParams } = request.nextUrl;
    const statusParam = searchParams.get("status")?.toUpperCase();

    let statusFilter: ReportStatus | undefined;
    if (statusParam && Object.values(ReportStatus).includes(statusParam as ReportStatus)) {
      statusFilter = statusParam as ReportStatus;
    } else {
      statusFilter = ReportStatus.PENDING;
    }

    const reports = await prisma.report.findMany({
      ...(statusFilter ? { where: { status: statusFilter } } : {}),
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            reputationScore: true,
          },
        },
        evidences: {
          select: {
            id: true,
            fileUrl: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
          },
        },
        blacklistEntry: {
          select: {
            id: true,
            status: true,
            totalReports: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const counts = await prisma.report.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const statusCounts = {
      PENDING: counts.find((c) => c.status === ReportStatus.PENDING)?._count.id || 0,
      APPROVED: counts.find((c) => c.status === ReportStatus.APPROVED)?._count.id || 0,
      REJECTED: counts.find((c) => c.status === ReportStatus.REJECTED)?._count.id || 0,
    };

    return NextResponse.json(
      {
        reports,
        total: reports.length,
        statusCounts,
      },
      { status: 200 },
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return problemResponse(500, "Internal Server Error", detail, undefined, "/api/admin/reports");
  }
}
