import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_PATHNAME_HEADER,
  AUTH_ROUTES,
  IP_POLICY_CACHE_SECONDS,
  PUBLIC_ADMIN_PATHS,
} from "@/constants/auth";
import { isIpAllowed } from "@/lib/security/securityPolicy";
import { resolveClientIp } from "@/lib/security/resolveClientIp";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

import type { SettingsRecord } from "@/types/settings";

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`),
  );
}

async function loadIpPolicy(request: NextRequest): Promise<Pick<SettingsRecord, "ipAllowList" | "ipBlockList">> {
  try {
    const response = await fetch(new URL("/api/internal/security/ip-policy", request.url), {
      headers: {
        "x-middleware-request": "1",
      },
      next: { revalidate: IP_POLICY_CACHE_SECONDS },
    });

    if (!response.ok) {
      return { ipAllowList: [], ipBlockList: [] };
    }

    const policy = (await response.json()) as {
      allowList?: string[];
      blockList?: string[];
    };

    return {
      ipAllowList: policy.allowList ?? [],
      ipBlockList: policy.blockList ?? [],
    };
  } catch {
    return { ipAllowList: [], ipBlockList: [] };
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(ADMIN_PATHNAME_HEADER, pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  const supabase = createMiddlewareClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && pathname === AUTH_ROUTES.login) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.dashboard, request.url));
  }

  if (!user && !isPublicAdminPath(pathname)) {
    const loginUrl = new URL(AUTH_ROUTES.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isPublicAdminPath(pathname)) {
    const ipPolicy = await loadIpPolicy(request);
    const clientIp = resolveClientIp(request);

    if (!isIpAllowed(clientIp, ipPolicy as SettingsRecord)) {
      if (user) {
        await supabase.auth.signOut();
      }

      const loginUrl = new URL(AUTH_ROUTES.login, request.url);
      loginUrl.searchParams.set("error", "ip_blocked");
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
