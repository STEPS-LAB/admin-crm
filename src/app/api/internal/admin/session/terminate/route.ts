import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ROUTES } from "@/constants/auth";
import { extractRequestMetadata } from "@/lib/security/requestMetadata";
import { clearAdminSessionCookies } from "@/lib/security/sessionCookies";
import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";
import { signOut } from "@/services/authenticationService";

const ALLOWED_TERMINATION_REASONS = new Set(["session_expired", "ip_blocked", "logout"]);

export async function GET(request: NextRequest): Promise<NextResponse> {
  const reasonParam = request.nextUrl.searchParams.get("reason") ?? "session_expired";
  const reason = ALLOWED_TERMINATION_REASONS.has(reasonParam) ? reasonParam : "session_expired";

  const user = await getAuthenticatedUser();
  const headersList = await headers();
  const metadata = extractRequestMetadata(headersList);

  await clearAdminSessionCookies();

  if (user) {
    await signOut(user.id, metadata);
  }

  const loginUrl = new URL(AUTH_ROUTES.login, request.url);

  if (reason !== "logout") {
    loginUrl.searchParams.set("error", reason);
  }

  return NextResponse.redirect(loginUrl);
}

export const dynamic = "force-dynamic";
