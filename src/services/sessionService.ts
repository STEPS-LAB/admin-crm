import { SESSION_ACTIVITY_TOUCH_INTERVAL_SECONDS } from "@/constants/auth";
import { resolveSessionExpiry, isSessionExpired } from "@/lib/security/securityPolicy";
import {
  createSession,
  deleteSession,
  deleteSessionsByProfileId,
  findSessionById,
  touchSessionActivity,
} from "@/repositories/sessionRepository";
import { getSettings } from "@/services/settingsService";

import type { RequestMetadata } from "@/lib/security/requestMetadata";
import type { SessionMetadata } from "@/types/auth";
import type { SettingsRecord } from "@/types/settings";

export type SessionValidationResult =
  | { readonly status: "valid"; readonly session: SessionMetadata }
  | { readonly status: "missing" }
  | { readonly status: "not_found" }
  | { readonly status: "expired" }
  | { readonly status: "profile_mismatch" };

export async function recordLoginSession(
  profileId: string,
  metadata: RequestMetadata,
  _rememberMe: boolean,
): Promise<SessionMetadata> {
  const settings = await getSettings();
  const expiresAt = resolveSessionExpiry(settings);

  return createSession({
    profileId,
    deviceName: metadata.deviceName,
    browser: metadata.browser,
    operatingSystem: metadata.operatingSystem,
    expiresAt,
  });
}

export async function revokeAllSessions(profileId: string): Promise<void> {
  await deleteSessionsByProfileId(profileId);
}

export async function validateAdminSession(
  sessionId: string | null | undefined,
  profileId: string,
  rememberMe: boolean,
  settingsOverride?: SettingsRecord,
): Promise<SessionValidationResult> {
  if (!sessionId) {
    return { status: "missing" };
  }

  const session = await findSessionById(sessionId);

  if (!session) {
    return { status: "not_found" };
  }

  if (session.profileId !== profileId) {
    return { status: "profile_mismatch" };
  }

  const settings = settingsOverride ?? (await getSettings());

  if (isSessionExpired(session, settings, rememberMe)) {
    await deleteSession(sessionId);
    return { status: "expired" };
  }

  const touchIntervalMs = SESSION_ACTIVITY_TOUCH_INTERVAL_SECONDS * 1000;
  const lastActivityMs = session.lastActivity?.getTime() ?? 0;
  const shouldTouch = Date.now() - lastActivityMs >= touchIntervalMs;

  if (shouldTouch) {
    await touchSessionActivity(sessionId);
  }

  return { status: "valid", session };
}

export async function establishAdminSession(
  profileId: string,
  metadata: RequestMetadata,
  rememberMe: boolean,
): Promise<SessionMetadata> {
  return recordLoginSession(profileId, metadata, rememberMe);
}
