import { IdentifierType, ReportStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { problemResponse } from "@/lib/api-response";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { defaultRateLimiter, getClientIp, getRateLimitHeaders } from "@/lib/rate-limit";
import { saveEvidenceFile } from "@/lib/storage";
import {
  MAX_EVIDENCE_FILES,
  MIN_EVIDENCE_FILES,
  reportInputSchema,
  validateEvidenceFile,
} from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request.headers);
    const rateLimit = defaultRateLimiter.check(`report:create:${clientIp}`, {
      maxRequests: 10,
      windowMs: 60_000,
    });
    const rateLimitHeaders = getRateLimitHeaders(rateLimit);

    if (!rateLimit.success) {
      return problemResponse(
        429,
        "Too Many Requests",
        "Terlalu banyak permintaan pengiriman laporan. Silakan tunggu beberapa saat lagi.",
        undefined,
        "/api/reports",
        rateLimitHeaders,
      );
    }

    const session = await getCurrentSession();

    if (!session) {
      return problemResponse(
        401,
        "Unauthorized",
        "Anda harus masuk ke akun terlebih dahulu untuk mengirimkan laporan penipuan.",
        undefined,
        "/api/reports",
      );
    }

    const formData = await request.formData();

    const rawInput = {
      identifierType: formData.get("identifierType"),
      identifierValue: formData.get("identifierValue"),
      bankName: formData.get("bankName") || undefined,
      chronology: formData.get("chronology"),
    };

    const parsedInput = reportInputSchema.safeParse(rawInput);
    if (!parsedInput.success) {
      const fieldErrors = parsedInput.error.flatten().fieldErrors;
      return problemResponse(
        400,
        "Validation Failed",
        "Formulir laporan tidak valid.",
        fieldErrors,
        "/api/reports",
      );
    }

    const { identifierType, identifierValue, bankName, chronology } = parsedInput.data;

    const rawFiles = formData.getAll("evidence");
    const evidenceFiles = rawFiles.filter(
      (item): item is File => item instanceof File && item.size > 0,
    );

    if (evidenceFiles.length < MIN_EVIDENCE_FILES) {
      return problemResponse(
        400,
        "Missing Evidence",
        `Wajib melampirkan minimal ${MIN_EVIDENCE_FILES} bukti tangkapan layar transaksi (struk transfer atau chat).`,
        { evidence: ["Wajib melampirkan minimal 1 bukti tangkapan layar"] },
        "/api/reports",
      );
    }

    if (evidenceFiles.length > MAX_EVIDENCE_FILES) {
      return problemResponse(
        400,
        "Excessive Evidence",
        `Maksimal bukti tangkapan layar yang diperbolehkan adalah ${MAX_EVIDENCE_FILES} file.`,
        { evidence: [`Maksimal ${MAX_EVIDENCE_FILES} file`] },
        "/api/reports",
      );
    }

    // Pre-validate all files
    for (const file of evidenceFiles) {
      const fileValidation = validateEvidenceFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!fileValidation.valid) {
        return problemResponse(
          400,
          "Invalid File",
          fileValidation.error || "Berkas bukti tidak memenuhi ketentuan keamanan dan privasi.",
          { evidence: [fileValidation.error || "Berkas tidak valid"] },
          "/api/reports",
        );
      }
    }

    // Save files to storage
    const savedFiles = [];
    for (const file of evidenceFiles) {
      const saved = await saveEvidenceFile(file);
      savedFiles.push(saved);
    }

    const dbIdentifierType =
      identifierType === "bank_account" ? IdentifierType.BANK_ACCOUNT : IdentifierType.WHATSAPP;

    // Create report record along with evidence metadata
    const report = await prisma.report.create({
      data: {
        reporterId: session.userId,
        targetType: dbIdentifierType,
        targetValue: identifierValue,
        bankName: bankName && bankName.length > 0 ? bankName : null,
        chronology,
        status: ReportStatus.PENDING,
        evidences: {
          create: savedFiles.map((f) => ({
            fileUrl: f.url,
            fileSize: f.size,
            mimeType: f.mimeType,
          })),
        },
      },
      include: {
        evidences: true,
      },
    });

    return NextResponse.json(
      {
        message:
          "Laporan penipuan berhasil dikirim dan saat ini masuk dalam antrean moderasi admin.",
        report: {
          id: report.id,
          targetType: report.targetType,
          targetValue: report.targetValue,
          bankName: report.bankName,
          status: report.status,
          createdAt: report.createdAt,
          evidenceCount: report.evidences.length,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return problemResponse(500, "Internal Server Error", detail, undefined, "/api/reports");
  }
}

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return problemResponse(
        401,
        "Unauthorized",
        "Anda harus masuk ke akun terlebih dahulu untuk melihat laporan Anda.",
        undefined,
        "/api/reports",
      );
    }

    const reports = await prisma.report.findMany({
      where: { reporterId: session.userId },
      include: {
        evidences: {
          select: {
            id: true,
            fileUrl: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return problemResponse(500, "Internal Server Error", detail, undefined, "/api/reports");
  }
}
