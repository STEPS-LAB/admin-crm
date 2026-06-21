import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_PATHNAME_HEADER,
  ADMIN_SESSION_ENSURE_PATH,
  ADMIN_SESSION_TERMINATE_PATH,
} from "@/constants/auth";
import { isIpAllowed } from "@/lib/security/securityPolicy";
import { extractRequestMetadata } from "@/lib/security/requestMetadata";
import { readAdminSessionCookies } from "@/lib/security/sessionCookies";
import { getSettings } from "@/services/settingsService";
import { validateAdminSession } from "@/services/sessionService";

import type { AuthUser } from "@/types/auth";
import type { SettingsRecord } from "@/types/settings";

function buildInternalRedirect(path: string, params: Record<string, string>): string {
  const searchParams = new URLSearchParams(params);
  return `${path}?${searchParams.toString()}`;
}

export async function enforceAdminSecurityGate(
  user: AuthUser,
  settingsOverride?: SettingsRecord,
): Promise<void> {
  const headersList = await headers();
  const metadata = extractRequestMetadata(headersList);
  const settings = settingsOverride ?? (await getSettings());
  const pathname = headersList.get(ADMIN_PATHNAME_HEADER) ?? "/admin";

  if (!isIpAllowed(metadata.ipAddress, settings)) {
    redirect(
      buildInternalRedirect(ADMIN_SESSION_TERMINATE_PATH, {
        reason: "ip_blocked",
      }),
    );
  }

  const { sessionId, rememberMe } = await readAdminSessionCookies();

  if (!sessionId) {
    redirect(
      buildInternalRedirect(ADMIN_SESSION_ENSURE_PATH, {
        redirect: pathname,
      }),
    );
  }

  const validation = await validateAdminSession(sessionId, user.id, rememberMe, settings);

  if (validation.status !== "valid") {
    redirect(
      buildInternalRedirect(ADMIN_SESSION_TERMINATE_PATH, {
        reason: "session_expired",
      }),
    );
  }
}
