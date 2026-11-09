import { type NextRequest, NextResponse } from "next/server";
import { problemResponse } from "@/lib/api-response";
import { createSessionToken, getSessionCookieOptions, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkTierRateLimit, getClientIp } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkTierRateLimit(clientIp, "AUTH", "auth:login");

    if (!rateLimit.allowed) {
      return problemResponse(
        429,
        "Too Many Requests",
        "Terlalu banyak percobaan masuk akun. Silakan coba beberapa saat lagi.",
        undefined,
        "/api/auth/login",
        rateLimit.headers,
      );
    }

    const json = await request.json();
    const result = loginSchema.safeParse(json);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return problemResponse(
        400,
        "Validation Failed",
        "Data login tidak valid",
        fieldErrors,
        "/api/auth/login",
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return problemResponse(
        401,
        "Unauthorized",
        "Email atau password tidak sesuai",
        undefined,
        "/api/auth/login",
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return problemResponse(
        401,
        "Unauthorized",
        "Email atau password tidak sesuai",
        undefined,
        "/api/auth/login",
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieOpts = getSessionCookieOptions();
    const response = NextResponse.json(
      {
        message: "Login berhasil",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          reputationScore: user.reputationScore,
        },
      },
      { status: 200 },
    );

    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return problemResponse(500, "Internal Server Error", detail, undefined, "/api/auth/login");
  }
}
