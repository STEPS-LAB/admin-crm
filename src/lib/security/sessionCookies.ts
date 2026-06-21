import { cookies } from "next/headers";

import {
  CMS_SESSION_COOKIE,
  CMS_SESSION_REMEMBER_COOKIE,
} from "@/constants/auth";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function readAdminSessionCookies(): Promise<{
  readonly sessionId: string | null;
  readonly rememberMe: boolean;
}> {
  const cookieStore = await cookies();

  return {
    sessionId: cookieStore.get(CMS_SESSION_COOKIE)?.value ?? null,
    rememberMe: cookieStore.get(CMS_SESSION_REMEMBER_COOKIE)?.value === "1",
  };
}

export async function setAdminSessionCookies(
  sessionId: string,
  rememberMe: boolean,
): Promise<void> {
  const cookieStore = await cookies();
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined;

  cookieStore.set(CMS_SESSION_COOKIE, sessionId, {
    ...SESSION_COOKIE_OPTIONS,
    ...(maxAge ? { maxAge } : {}),
  });
  cookieStore.set(CMS_SESSION_REMEMBER_COOKIE, rememberMe ? "1" : "0", {
    ...SESSION_COOKIE_OPTIONS,
    ...(maxAge ? { maxAge } : {}),
  });
}

export async function clearAdminSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CMS_SESSION_COOKIE);
  cookieStore.delete(CMS_SESSION_REMEMBER_COOKIE);
}
