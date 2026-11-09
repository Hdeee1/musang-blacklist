import { BlacklistStatus, ReportStatus, Role } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { problemResponse } from "@/lib/api-response";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { moderationActionSchema } from "@/lib/validations";

interface RouteParams {
  readonly params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return problemResponse(
        401,
        "Unauthorized",
        "Sesi login tidak ditemukan atau kedaluwarsa.",
        undefined,
        request.nextUrl.pathname,
      );
    }

    if (session.role !== Role.ADMIN) {
      return problemResponse(
        403,
        "Forbidden",
        "Akses ditolak. Tindakan ini hanya boleh dilakukan oleh Administrator.",
        undefined,
        request.nextUrl.pathname,
      );
    }

    const { id: reportId } = await params;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { reporter: true },
    });

    if (!report) {
      return problemResponse(
        404,
        "Not Found",
        "Laporan yang dimaksud tidak ditemukan dalam sistem.",
        undefined,
        request.nextUrl.pathname,
      );
    }

    if (report.status !== ReportStatus.PENDING) {
      return problemResponse(
        409,
        "Conflict",
        `Laporan ini telah dimoderasi sebelumnya dengan status ${report.status}.`,
        undefined,
        request.nextUrl.pathname,
      );
    }

    const json = await request.json();
    const parsed = moderationActionSchema.safeParse(json);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return problemResponse(
        400,
        "Validation Failed",
        "Payload aksi moderasi tidak valid.",
        fieldErrors,
        request.nextUrl.pathname,
      );
    }

    const { action, notes, isSpam } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();

      if (action === "APPROVE") {
        // Find or create BlacklistEntry
        const blacklistEntry = await tx.blacklistEntry.upsert({
          where: {
            identifierType_identifierValue: {
              identifierType: report.targetType,
              identifierValue: report.targetValue,
            },
          },
          create: {
            identifierType: report.targetType,
            identifierValue: report.targetValue,
            bankName: report.bankName ?? null,
            status: BlacklistStatus.BLACKLISTED,
            totalReports: 1,
            lastReportedAt: now,
          },
          update: {
            status: BlacklistStatus.BLACKLISTED,
            totalReports: { increment: 1 },
            lastReportedAt: now,
            ...(report.bankName ? { bankName: report.bankName } : {}),
          },
        });

        // Update Report status
        const updatedReport = await tx.report.update({
          where: { id: report.id },
          data: {
            status: ReportStatus.APPROVED,
            blacklistEntryId: blacklistEntry.id,
            reviewedById: session.userId,
            reviewedAt: now,
          },
        });

        // Reward reporter (+10 reputation score)
        await tx.user.update({
          where: { id: report.reporterId },
          data: {
            reputationScore: { increment: 10 },
          },
        });

        // Create Moderation Log
        await tx.moderationLog.create({
          data: {
            reportId: report.id,
            adminId: session.userId,
            action: "APPROVE",
            notes: notes || "Laporan dan bukti diverifikasi valid oleh admin.",
          },
        });

        return {
          status: updatedReport.status,
          blacklistEntryId: blacklistEntry.id,
        };
      }

      // Action: REJECT
      const updatedReport = await tx.report.update({
        where: { id: report.id },
        data: {
          status: ReportStatus.REJECTED,
          rejectionReason: notes || "Laporan ditolak karena bukti tidak memadai.",
          reviewedById: session.userId,
          reviewedAt: now,
        },
      });

      // Penalize reporter if spam (-20 reputation score)
      if (isSpam) {
        await tx.user.update({
          where: { id: report.reporterId },
          data: {
            reputationScore: { decrement: 20 },
          },
        });
      }

      // Create Moderation Log
      await tx.moderationLog.create({
        data: {
          reportId: report.id,
          adminId: session.userId,
          action: "REJECT",
          notes: notes || (isSpam ? "Ditolak sebagai laporan palsu/spam." : "Ditolak."),
        },
      });

      return {
        status: updatedReport.status,
        blacklistEntryId: null,
      };
    });

    return NextResponse.json(
      {
        message:
          action === "APPROVE"
            ? "Laporan berhasil disetujui. Data telah dimasukkan ke daftar blacklist publik."
            : "Laporan berhasil ditolak dan diarsipkan.",
        reportId: report.id,
        status: result.status,
        blacklistEntryId: result.blacklistEntryId,
      },
      { status: 200 },
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return problemResponse(
      500,
      "Internal Server Error",
      detail,
      undefined,
      request.nextUrl.pathname,
    );
  }
}
