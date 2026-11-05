import { IdentifierType, PrismaClient, ReportStatus, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Upsert Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@musang.local" },
    update: {},
    create: {
      email: "admin@musang.local",
      // Placeholder hash for "AdminSecret123!"
      passwordHash: "$2a$12$e80yq2g92bS3i.87f7dF7eN80jB6YJc2XfV7g.H2a8K4I0/N0w52e",
      role: Role.ADMIN,
      reputationScore: 999,
    },
  });

  // Upsert Reporter User
  const reporter = await prisma.user.upsert({
    where: { email: "reporter@musang.local" },
    update: {},
    create: {
      email: "reporter@musang.local",
      // Placeholder hash for "ReporterSecret123!"
      passwordHash: "$2a$12$e80yq2g92bS3i.87f7dF7eN80jB6YJc2XfV7g.H2a8K4I0/N0w52e",
      role: Role.REPORTER,
      reputationScore: 100,
    },
  });

  // Upsert Sample Blacklist Entry
  const blacklistEntry = await prisma.blacklistEntry.upsert({
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
      accountHolder: "Pelaku Fiktif",
      totalReports: 1,
    },
  });

  // Sample Approved Report
  const existingReport = await prisma.report.findFirst({
    where: {
      targetType: IdentifierType.BANK_ACCOUNT,
      targetValue: "1234567890",
    },
  });

  if (!existingReport) {
    const report = await prisma.report.create({
      data: {
        reporterId: reporter.id,
        blacklistEntryId: blacklistEntry.id,
        targetType: IdentifierType.BANK_ACCOUNT,
        targetValue: "1234567890",
        bankName: "BCA",
        chronology: "Pelaku menawarkan barang elektronik fiktif lalu memblokir WhatsApp korban.",
        status: ReportStatus.APPROVED,
        reviewedById: admin.id,
        reviewedAt: new Date(),
        evidences: {
          create: [
            {
              fileUrl: "https://example.com/evidence/transfer_bca_1234567890.jpg",
              fileSize: 245000,
              mimeType: "image/jpeg",
            },
          ],
        },
        moderationLogs: {
          create: [
            {
              adminId: admin.id,
              action: "APPROVE",
              notes: "Bukti mutasi rekening dan tangkapan layar chat valid.",
            },
          ],
        },
      },
    });

    console.log(`Created sample report: ${report.id}`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

