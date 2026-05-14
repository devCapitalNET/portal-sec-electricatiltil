import { cookies } from "next/headers";

const COOKIE = "tiltil_token";

export async function setAuthCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getAuthToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value || null;
}

export const AUTH_COOKIE_NAME = COOKIE;
