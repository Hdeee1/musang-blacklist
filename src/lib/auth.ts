import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, type SessionPayload, verifySessionToken } from "./session";

export * from "./session";
export * from "./password";

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  return verifySessionToken(sessionCookie.value);
}
