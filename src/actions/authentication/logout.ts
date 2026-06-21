"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/constants/auth";
import { getAuthenticatedUser, signOut } from "@/services/authenticationService";
import { extractRequestMetadata } from "@/lib/security/requestMetadata";
import { clearAdminSessionCookies } from "@/lib/security/sessionCookies";

export async function logoutAction(): Promise<void> {
  const user = await getAuthenticatedUser();
  const headersList = await headers();
  const metadata = extractRequestMetadata(headersList);

  await signOut(user?.id ?? null, metadata);
  await clearAdminSessionCookies();
  redirect(AUTH_ROUTES.login);
}
