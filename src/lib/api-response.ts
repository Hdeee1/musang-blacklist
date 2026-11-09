import { NextResponse } from "next/server";

export interface ProblemDetails {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly instance?: string;
  readonly errors?: Record<string, string[]>;
}

export function problemResponse(
  status: number,
  title: string,
  detail: string,
  errors?: Record<string, string[]>,
  instance?: string,
): NextResponse<ProblemDetails> {
  const body: ProblemDetails = {
    type: "about:blank",
    title,
    status,
    detail,
    ...(errors ? { errors } : {}),
    ...(instance ? { instance } : {}),
  };

  return NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/problem+json",
    },
  });
}

