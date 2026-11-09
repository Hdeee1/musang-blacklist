import { Role } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { problemResponse } from "@/lib/api-response";
import { createSessionToken, getSessionCookieOptions, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = registerSchema.safeParse(json);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return problemResponse(
        400,
        "Validation Failed",
        "Data pendaftaran tidak valid",
        fieldErrors,
        "/api/auth/register",
      );
    }

    const { email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return problemResponse(
        409,
        "Conflict",
        "Email sudah terdaftar dalam sistem",
        undefined,
        "/api/auth/register",
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.REPORTER,
        reputationScore: 100,
      },
      select: {
        id: true,
        email: true,
        role: true,
        reputationScore: true,
        createdAt: true,
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieOpts = getSessionCookieOptions();
    const response = NextResponse.json(
      {
        message: "Pendaftaran berhasil",
        user,
      },
      { status: 201 },
    );

    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return problemResponse(500, "Internal Server Error", detail, undefined, "/api/auth/register");
  }
}
