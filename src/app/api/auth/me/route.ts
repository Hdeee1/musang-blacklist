import { NextResponse } from "next/server";
import { problemResponse } from "@/lib/api-response";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return problemResponse(
      401,
      "Unauthorized",
      "Sesi login tidak ditemukan atau telah kedaluwarsa",
      undefined,
      "/api/auth/me",
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      role: true,
      reputationScore: true,
      createdAt: true,
    },
  });

  if (!user) {
    return problemResponse(404, "Not Found", "Pengguna tidak ditemukan", undefined, "/api/auth/me");
  }

  return NextResponse.json({ user }, { status: 200 });
}

