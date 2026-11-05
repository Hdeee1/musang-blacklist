import { NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const cookieOpts = getSessionCookieOptions();
  const response = NextResponse.json(
    {
      message: "Logout berhasil",
    },
    { status: 200 },
  );

  response.cookies.set(cookieOpts.name, "", {
    ...cookieOpts,
    maxAge: 0,
  });

  return response;
}
