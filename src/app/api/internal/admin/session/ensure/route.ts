import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ROUTES } from "@/constants/auth";
import { extractRequestMetadata } from "@/lib/security/requestMetadata";
import {
  readAdminSessionCookies,
  setAdminSessionCookies,
} from "@/lib/security/sessionCookies";
import { getAuthenticatedUser } from "@/services/authenticationService";
import {
  establishAdminSession,
  validateAdminSession,
} from "@/services/sessionService";

function resolveRedirectTarget(request: NextRequest): string {
  const redirectParam = request.nextUrl.searchParams.get("redirect");

  if (redirectParam?.startsWith("/admin")) {
    return redirectParam;
  }

  return AUTH_ROUTES.dashboard;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.login, request.url));
  }

  const headersList = await headers();
  const metadata = extractRequestMetadata(headersList);
  const { sessionId, rememberMe } = await readAdminSessionCookies();

  if (sessionId) {
    const validation = await validateAdminSession(sessionId, user.id, rememberMe);

    if (validation.status === "valid") {
      return NextResponse.redirect(new URL(resolveRedirectTarget(request), request.url));
    }
  }

  const session = await establishAdminSession(user.id, metadata, rememberMe);
  await setAdminSessionCookies(session.id, rememberMe);

  return NextResponse.redirect(new URL(resolveRedirectTarget(request), request.url));
}

export const dynamic = "force-dynamic";
