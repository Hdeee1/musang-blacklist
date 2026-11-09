import { BlacklistStatus, ReportStatus } from "@prisma/client";
import { prisma } from "./db";

export interface NormalizedQuery {
  readonly raw: string;
  readonly sanitized: string;
  readonly variants: string[];
}

export function normalizeSearchQuery(raw: string): NormalizedQuery {
  const sanitized = raw.trim().replace(/[\s\-().]/g, "");
  const variants = new Set<string>();

  // If phone number pattern
  if (sanitized.startsWith("+62")) {
    const local = "0" + sanitized.slice(3);
    variants.add(local);
    variants.add(sanitized.slice(1)); // 62...
  } else if (sanitized.startsWith("62")) {
    const local = "0" + sanitized.slice(2);
    variants.add(local);
    variants.add("+" + sanitized);
  } else if (sanitized.startsWith("08")) {
    const intl = "+62" + sanitized.slice(1);
    const intlNoPlus = "62" + sanitized.slice(1);
    variants.add(intl);
    variants.add(intlNoPlus);
  }

  return {
    raw,
    sanitized,
    variants: Array.from(variants),
  };
}

export async function searchBlacklistEntries(query: string) {
  const { sanitized, variants } = normalizeSearchQuery(query);
  const searchValues = [sanitized, ...variants];

  const entries = await prisma.blacklistEntry.findMany({
    where: {
      identifierValue: { in: searchValues },
      status: BlacklistStatus.BLACKLISTED,
    },
    include: {
      reports: {
        where: { status: ReportStatus.APPROVED },
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
      },
    },
    orderBy: { lastReportedAt: "desc" },
  });

  return {
    query: sanitized,
    found: entries.length > 0,
    total: entries.length,
    entries,
  };
}

export async function getBlacklistEntryById(id: string) {
  return prisma.blacklistEntry.findUnique({
    where: { id },
    include: {
      reports: {
        where: { status: ReportStatus.APPROVED },
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
      },
    },
  });
}
