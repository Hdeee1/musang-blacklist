import fs from "node:fs";
import path from "node:path";
import { IdentifierType, PrismaClient, ReportStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Minimal valid PNG buffer
const DUMMY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function ensureSampleEvidenceFile(filename: string): string {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "evidence");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, Buffer.from(DUMMY_PNG_BASE64, "base64"));
  }

  return `/uploads/evidence/${filename}`;
}

async function main() {
  console.log("Seeding database with realistic test data for manual testing...");

  // 1. Password hashes
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const userPasswordHash = await bcrypt.hash("User123!", 10);

  // 2. Sample Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@musang.local" },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: "admin@musang.local",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      reputationScore: 999,
    },
  });

  const reporterKorban = await prisma.user.upsert({
    where: { email: "korban@musang.local" },
    update: { passwordHash: userPasswordHash },
    create: {
      email: "korban@musang.local",
      passwordHash: userPasswordHash,
      role: Role.REPORTER,
      reputationScore: 100,
    },
  });

  const reporterRekber = await prisma.user.upsert({
    where: { email: "rekber@musang.local" },
    update: { passwordHash: userPasswordHash },
    create: {
      email: "rekber@musang.local",
      passwordHash: userPasswordHash,
      role: Role.REPORTER,
      reputationScore: 150,
    },
  });

  console.log(`Users seeded:
  - Admin:    admin@musang.local / Admin123!
  - Reporter: korban@musang.local / User123!
  - Rekber:   rekber@musang.local / User123!`);

  // 3. Sample Dummy Evidence Files on disk
  const fileTransferBca1 = ensureSampleEvidenceFile("sample-transfer-bca-1.png");
  const fileChatBca1 = ensureSampleEvidenceFile("sample-chat-bca-1.png");
  const fileTransferBca2 = ensureSampleEvidenceFile("sample-transfer-bca-2.png");
  const fileChatRekberWa = ensureSampleEvidenceFile("sample-rekber-wa.png");
  const fileTransferMandiri = ensureSampleEvidenceFile("sample-coldplay-mandiri.png");
  const fileBriJastip1 = ensureSampleEvidenceFile("sample-jastip-bri-transfer.png");
  const fileBriJastip2 = ensureSampleEvidenceFile("sample-jastip-bri-chat.png");
  const fileWaPhishing = ensureSampleEvidenceFile("sample-undian-wa.png");
  const fileWaSpam = ensureSampleEvidenceFile("sample-spam-wa.png");

  // 4. APPROVED Blacklist Entries (Testing Pencarian Publik & Halaman Detail)

  // Entry 1: BCA 1234567890 (2 verified reports)
  const blacklistBca = await prisma.blacklistEntry.upsert({
    where: {
      identifierType_identifierValue: {
        identifierType: IdentifierType.BANK_ACCOUNT,
        identifierValue: "1234567890",
      },
    },
    update: {},
    create: {
      identifierType: IdentifierType.BANK_ACCOUNT,
      identifierValue: "1234567890",
      bankName: "BCA",
      accountHolder: "Joko Penipu Fiktif",
      status: "BLACKLISTED",
      totalReports: 2,
    },
  });

  const existingBcaReport1 = await prisma.report.findFirst({
    where: {
      targetType: IdentifierType.BANK_ACCOUNT,
      targetValue: "1234567890",
      reporterId: reporterKorban.id,
    },
  });

  if (!existingBcaReport1) {
    await prisma.report.create({
      data: {
        reporterId: reporterKorban.id,
        blacklistEntryId: blacklistBca.id,
        targetType: IdentifierType.BANK_ACCOUNT,
        targetValue: "1234567890",
        bankName: "BCA",
        chronology:
          "Menawarkan unit iPhone 15 Pro Max di FB Marketplace dengan harga murah. Setelah ditransfer DP Rp 2.500.000, pelaku langsung memblokir WhatsApp dan nomor telepon.",
        status: ReportStatus.APPROVED,
        reviewedById: admin.id,
        reviewedAt: new Date(Date.now() - 86400000 * 3),
        evidences: {
          create: [
            { fileUrl: fileTransferBca1, fileSize: 184500, mimeType: "image/png" },
            { fileUrl: fileChatBca1, fileSize: 215000, mimeType: "image/png" },
          ],
        },
        moderationLogs: {
          create: [
            {
              adminId: admin.id,
              action: "APPROVE",
              notes: "Bukti mutasi m-banking dan screenshot chat WhatsApp valid dan sinkron.",
            },
          ],
        },
      },
    });
  }

  const existingBcaReport2 = await prisma.report.findFirst({
    where: {
      targetType: IdentifierType.BANK_ACCOUNT,
      targetValue: "1234567890",
      reporterId: reporterRekber.id,
    },
  });

  if (!existingBcaReport2) {
    await prisma.report.create({
      data: {
        reporterId: reporterRekber.id,
        blacklistEntryId: blacklistBca.id,
        targetType: IdentifierType.BANK_ACCOUNT,
        targetValue: "1234567890",
        bankName: "BCA",
        chronology:
          "Kasus kedua dari rekber: Pelaku menggunakan nomor rekening yang sama untuk transaksi kamera mirrorless Sony A7 III fiktif senilai Rp 4.200.000.",
        status: ReportStatus.APPROVED,
        reviewedById: admin.id,
        reviewedAt: new Date(Date.now() - 86400000),
        evidences: {
          create: [{ fileUrl: fileTransferBca2, fileSize: 198000, mimeType: "image/png" }],
        },
        moderationLogs: {
          create: [
            {
              adminId: admin.id,
              action: "APPROVE",
              notes: "Laporan tambahan valid memperkuat status blacklist penipu kambuhan.",
            },
          ],
        },
      },
    });
  }

  // Entry 2: WhatsApp 08123456789
  const blacklistWa = await prisma.blacklistEntry.upsert({
    where: {
      identifierType_identifierValue: {
        identifierType: IdentifierType.WHATSAPP,
        identifierValue: "08123456789",
      },
    },
    update: {},
    create: {
      identifierType: IdentifierType.WHATSAPP,
      identifierValue: "08123456789",
      status: "BLACKLISTED",
      totalReports: 1,
    },
  });

  const existingWaReport = await prisma.report.findFirst({
    where: {
      targetType: IdentifierType.WHATSAPP,
      targetValue: "08123456789",
    },
  });

  if (!existingWaReport) {
    await prisma.report.create({
      data: {
        reporterId: reporterKorban.id,
        blacklistEntryId: blacklistWa.id,
        targetType: IdentifierType.WHATSAPP,
        targetValue: "08123456789",
        chronology:
          "Mengaku sebagai admin rekber resmi grup komunitas reptil di Facebook. Setelah dana pembeli Rp 1.800.000 dititipkan, nomor WA korban langsung diblokir dan pelaku keluar grup.",
        status: ReportStatus.APPROVED,
        reviewedById: admin.id,
        reviewedAt: new Date(Date.now() - 86400000 * 2),
        evidences: {
          create: [{ fileUrl: fileChatRekberWa, fileSize: 220000, mimeType: "image/png" }],
        },
        moderationLogs: {
          create: [
            {
              adminId: admin.id,
              action: "APPROVE",
              notes: "Nomor WhatsApp terbukti melakukan penipuan rekber palsu.",
            },
          ],
        },
      },
    });
  }

  // Entry 3: Bank Mandiri 1370012345678
  const blacklistMandiri = await prisma.blacklistEntry.upsert({
    where: {
      identifierType_identifierValue: {
        identifierType: IdentifierType.BANK_ACCOUNT,
        identifierValue: "1370012345678",
      },
    },
    update: {},
    create: {
      identifierType: IdentifierType.BANK_ACCOUNT,
      identifierValue: "1370012345678",
      bankName: "MANDIRI",
      accountHolder: "Toko Ponsel Bodong",
      status: "BLACKLISTED",
      totalReports: 1,
    },
  });

  const existingMandiriReport = await prisma.report.findFirst({
    where: {
      targetType: IdentifierType.BANK_ACCOUNT,
      targetValue: "1370012345678",
    },
  });

  if (!existingMandiriReport) {
    await prisma.report.create({
      data: {
        reporterId: reporterRekber.id,
        blacklistEntryId: blacklistMandiri.id,
        targetType: IdentifierType.BANK_ACCOUNT,
        targetValue: "1370012345678",
        bankName: "MANDIRI",
        chronology:
          "Penjualan tiket konser Coldplay fiktif melalui channel Telegram. Korban mentransfer Rp 3.200.000 ke rekening Mandiri ini tapi tiket tidak pernah dikirim.",
        status: ReportStatus.APPROVED,
        reviewedById: admin.id,
        reviewedAt: new Date(Date.now() - 86400000 * 5),
        evidences: {
          create: [{ fileUrl: fileTransferMandiri, fileSize: 240000, mimeType: "image/png" }],
        },
        moderationLogs: {
          create: [
            {
              adminId: admin.id,
              action: "APPROVE",
              notes: "Tangkapan layar transaksi bank dan chat Telegram terverifikasi.",
            },
          ],
        },
      },
    });
  }

  // 5. PENDING Reports (Untuk Admin Test Approve / Reject di /admin/moderation)

  // Pending 1: Rekening BRI - Valid Case (Siap di-APPROVE admin)
  const existingPendingBri = await prisma.report.findFirst({
    where: {
      targetType: IdentifierType.BANK_ACCOUNT,
      targetValue: "001201999888501",
    },
  });

  if (!existingPendingBri) {
    await prisma.report.create({
      data: {
        reporterId: reporterKorban.id,
        targetType: IdentifierType.BANK_ACCOUNT,
        targetValue: "001201999888501",
        bankName: "BRI",
        chronology:
          "Pelaku menawarkan jasa titip (jastip) elektronik dari Jepang. Meminta DP Rp 1.500.000 ke rekening BRI ini. Setelah ditransfer, nomor resi pengiriman yang diberikan palsu dan tidak bisa dilacak di ekspedisi.",
        status: ReportStatus.PENDING,
        evidences: {
          create: [
            { fileUrl: fileBriJastip1, fileSize: 185000, mimeType: "image/png" },
            { fileUrl: fileBriJastip2, fileSize: 195000, mimeType: "image/png" },
          ],
        },
      },
    });
  }

  // Pending 2: WhatsApp - Phishing Undian (Siap di-APPROVE admin)
  const existingPendingWa = await prisma.report.findFirst({
    where: {
      targetType: IdentifierType.WHATSAPP,
      targetValue: "085712345678",
    },
  });

  if (!existingPendingWa) {
    await prisma.report.create({
      data: {
        reporterId: reporterRekber.id,
        targetType: IdentifierType.WHATSAPP,
        targetValue: "085712345678",
        chronology:
          "Mengirimkan broadcast WhatsApp penipuan yang mencatut nama marketplace besar, mengklaim memenangkan voucher Rp 10.000.000 dengan syarat transfer biaya admin Rp 350.000.",
        status: ReportStatus.PENDING,
        evidences: {
          create: [{ fileUrl: fileWaPhishing, fileSize: 210000, mimeType: "image/png" }],
        },
      },
    });
  }

  // Pending 3: WhatsApp - Fake / Spam Report (Siap di-REJECT admin dengan penalty spam)
  const existingPendingSpam = await prisma.report.findFirst({
    where: {
      targetType: IdentifierType.WHATSAPP,
      targetValue: "089988776655",
    },
  });

  if (!existingPendingSpam) {
    await prisma.report.create({
      data: {
        reporterId: reporterKorban.id,
        targetType: IdentifierType.WHATSAPP,
        targetValue: "089988776655",
        chronology:
          "Orang ini membatalkan janji COD sepihak dan membalas pesan dengan kata-kata tidak sopan.",
        status: ReportStatus.PENDING,
        evidences: {
          create: [{ fileUrl: fileWaSpam, fileSize: 110000, mimeType: "image/png" }],
        },
      },
    });
  }

  console.log("Seeding completed successfully with rich test scenarios!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
