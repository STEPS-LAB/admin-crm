import { checkRateLimit, clearRateLimit, recordFailedAttempt } from "@/lib/security/rateLimiter";
import { isIpAllowed, resolveLoginRateLimitPolicy } from "@/lib/security/securityPolicy";
import {
  findProfileByEmail,
  findProfileById,
  upsertProfile,
} from "@/repositories/profileRepository";
import { createClient } from "@/lib/supabase/server";
import { logAuthEvent } from "@/services/auditService";
import { getSettings } from "@/services/settingsService";
import { recordLoginSession, revokeAllSessions } from "@/services/sessionService";

import type { RequestMetadata } from "@/lib/security/requestMetadata";
import type { AuthUser } from "@/types/auth";
import type { LoginInput } from "@/schemas/authentication/loginSchema";

export interface LoginResult {
  readonly success: true;
  readonly user: AuthUser;
  readonly sessionId: string;
  readonly rememberMe: boolean;
}

export interface LoginError {
  readonly success: false;
  readonly error: string;
  readonly code: string;
}

export type AuthenticateResult = LoginResult | LoginError;

function buildRateLimitKey(email: string, metadata: RequestMetadata): string {
  return `${metadata.ipAddress ?? "unknown"}:${email.toLowerCase()}`;
}

export async function authenticate(
  input: LoginInput,
  metadata: RequestMetadata,
): Promise<AuthenticateResult> {
  const settings = await getSettings();

  if (!isIpAllowed(metadata.ipAddress, settings)) {
    return {
      success: false,
      error: "Access denied from this IP address.",
      code: "IP_BLOCKED",
    };
  }

  const rateLimitKey = buildRateLimitKey(input.email, metadata);
  const loginPolicy = resolveLoginRateLimitPolicy(settings);

  if (loginPolicy.enabled) {
    const rateCheck = checkRateLimit(rateLimitKey, loginPolicy.maxAttempts, loginPolicy.windowMs);

    if (!rateCheck.allowed) {
      return {
        success: false,
        error: "Too many failed attempts. Please try again later.",
        code: "RATE_LIMITED",
      };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.user) {
    if (loginPolicy.enabled) {
      const attempt = recordFailedAttempt(
        rateLimitKey,
        loginPolicy.maxAttempts,
        loginPolicy.windowMs,
      );

      if (!attempt.allowed) {
        await logAuthEvent({
          profileId: (await findProfileByEmail(input.email))?.id ?? null,
          action: "FAILED_LOGIN",
          metadata,
        });

        return {
          success: false,
          error: "Too many failed attempts. Please try again later.",
          code: "RATE_LIMITED",
        };
      }
    }

    const profile = await findProfileByEmail(input.email);

    await logAuthEvent({
      profileId: profile?.id ?? null,
      action: "FAILED_LOGIN",
      metadata,
    });

    return {
      success: false,
      error: "Invalid email or password.",
      code: "INVALID_CREDENTIALS",
    };
  }

  if (!data.user.email) {
    return {
      success: false,
      error: "Invalid email or password.",
      code: "INVALID_CREDENTIALS",
    };
  }

  clearRateLimit(rateLimitKey);

  const displayName =
    (typeof data.user.user_metadata?.display_name === "string"
      ? data.user.user_metadata.display_name
      : null) ??
    data.user.email.split("@")[0] ??
    "Administrator";

  const user = await upsertProfile({
    id: data.user.id,
    email: data.user.email,
    displayName,
    avatarUrl:
      typeof data.user.user_metadata?.avatar_url === "string"
        ? data.user.user_metadata.avatar_url
        : null,
  });

  if (!user.isActive) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Your account has been deactivated.",
      code: "ACCOUNT_INACTIVE",
    };
  }

  const session = await recordLoginSession(user.id, metadata, input.rememberMe);

  await logAuthEvent({
    profileId: user.id,
    action: "LOGIN",
    metadata,
  });

  return {
    success: true,
    user,
    sessionId: session.id,
    rememberMe: input.rememberMe,
  };
}

export async function signOut(profileId: string | null, metadata: RequestMetadata): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  if (profileId) {
    await revokeAllSessions(profileId);
    await logAuthEvent({
      profileId,
      action: "LOGOUT",
      metadata,
    });
  }
}

export async function resolveAuthenticatedUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user?.email) {
    return null;
  }

  const profile = await findProfileById(data.user.id);

  if (profile && !profile.isActive) {
    return null;
  }

  if (profile) {
    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      locale: profile.locale,
      timezone: profile.timezone,
      isActive: profile.isActive,
    };
  }

  const displayName =
    (typeof data.user.user_metadata?.display_name === "string"
      ? data.user.user_metadata.display_name
      : null) ??
    data.user.email.split("@")[0] ??
    "Administrator";

  return upsertProfile({
    id: data.user.id,
    email: data.user.email,
    displayName,
    avatarUrl:
      typeof data.user.user_metadata?.avatar_url === "string"
        ? data.user.user_metadata.avatar_url
        : null,
  });
}
