import type { SettingsRecord } from "@/types/settings";

export interface LoginRateLimitPolicy {
  readonly maxAttempts: number;
  readonly windowMs: number;
  readonly enabled: boolean;
}

export interface SessionLifetimePolicy {
  readonly idleTimeoutHours: number;
  readonly absoluteLifetimeHours: number;
}

export function resolveLoginRateLimitPolicy(settings: SettingsRecord): LoginRateLimitPolicy {
  return {
    enabled: settings.loginLockoutEnabled,
    maxAttempts: settings.loginMaxAttempts,
    windowMs: settings.loginLockoutWindowMinutes * 60 * 1000,
  };
}

export function resolveSessionLifetimePolicy(
  settings: SettingsRecord,
  rememberMe: boolean,
): SessionLifetimePolicy {
  if (rememberMe) {
    return {
      idleTimeoutHours: settings.sessionAbsoluteLifetimeHours,
      absoluteLifetimeHours: settings.sessionAbsoluteLifetimeHours,
    };
  }

  return {
    idleTimeoutHours: settings.sessionIdleTimeoutHours,
    absoluteLifetimeHours: settings.sessionAbsoluteLifetimeHours,
  };
}

export function resolveSessionExpiry(settings: SettingsRecord): Date {
  return new Date(Date.now() + settings.sessionAbsoluteLifetimeHours * 60 * 60 * 1000);
}

export function isSessionExpired(
  session: {
    readonly lastActivity: Date | null;
    readonly createdAt: Date;
    readonly expiresAt: Date | null;
  },
  settings: SettingsRecord,
  rememberMe: boolean,
): boolean {
  const now = Date.now();

  if (session.expiresAt && session.expiresAt.getTime() <= now) {
    return true;
  }

  const absoluteDeadline =
    session.createdAt.getTime() + settings.sessionAbsoluteLifetimeHours * 60 * 60 * 1000;

  if (now >= absoluteDeadline) {
    return true;
  }

  const policy = resolveSessionLifetimePolicy(settings, rememberMe);
  const lastActivityMs = session.lastActivity?.getTime() ?? session.createdAt.getTime();
  const idleDeadline = lastActivityMs + policy.idleTimeoutHours * 60 * 60 * 1000;

  return now >= idleDeadline;
}

export function isIpAllowed(
  ipAddress: string | null,
  settings: SettingsRecord,
): boolean {
  const normalizedIp = ipAddress?.trim();

  if (!normalizedIp) {
    return settings.ipAllowList.length === 0;
  }

  if (settings.ipBlockList.includes(normalizedIp)) {
    return false;
  }

  if (settings.ipAllowList.length === 0) {
    return true;
  }

  return settings.ipAllowList.includes(normalizedIp);
}
