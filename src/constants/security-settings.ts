export const SECURITY_LEVELS = ["standard", "enhanced", "enterprise"] as const;

export type SecurityLevel = (typeof SECURITY_LEVELS)[number];

export const SECURITY_LEVEL_LABELS: Record<SecurityLevel, string> = {
  standard: "Standard",
  enhanced: "Enhanced",
  enterprise: "Enterprise",
};

export const SECURITY_LEVEL_DESCRIPTIONS: Record<SecurityLevel, string> = {
  standard: "Balanced defaults for small teams and staging environments.",
  enhanced: "Stricter login limits and shorter sessions for production storefronts.",
  enterprise: "Maximum lockout protection and aggressive rate limits for high-risk deployments.",
};

export interface SecurityPolicyPreset {
  readonly sessionIdleTimeoutHours: number;
  readonly sessionAbsoluteLifetimeHours: number;
  readonly loginMaxAttempts: number;
  readonly loginLockoutWindowMinutes: number;
  readonly loginLockoutEnabled: boolean;
  readonly rateLimitSettingsPerMinute: number;
  readonly rateLimitUploadPerMinute: number;
  readonly rateLimitApiPerMinute: number;
  readonly rateLimitSearchPerMinute: number;
  readonly rateLimitImportPerMinute: number;
  readonly rateLimitExportPerMinute: number;
}

export const SECURITY_LEVEL_PRESETS: Record<SecurityLevel, SecurityPolicyPreset> = {
  standard: {
    sessionIdleTimeoutHours: 8,
    sessionAbsoluteLifetimeHours: 24,
    loginMaxAttempts: 5,
    loginLockoutWindowMinutes: 15,
    loginLockoutEnabled: true,
    rateLimitSettingsPerMinute: 20,
    rateLimitUploadPerMinute: 30,
    rateLimitApiPerMinute: 100,
    rateLimitSearchPerMinute: 60,
    rateLimitImportPerMinute: 10,
    rateLimitExportPerMinute: 10,
  },
  enhanced: {
    sessionIdleTimeoutHours: 4,
    sessionAbsoluteLifetimeHours: 12,
    loginMaxAttempts: 5,
    loginLockoutWindowMinutes: 30,
    loginLockoutEnabled: true,
    rateLimitSettingsPerMinute: 12,
    rateLimitUploadPerMinute: 20,
    rateLimitApiPerMinute: 60,
    rateLimitSearchPerMinute: 30,
    rateLimitImportPerMinute: 6,
    rateLimitExportPerMinute: 6,
  },
  enterprise: {
    sessionIdleTimeoutHours: 2,
    sessionAbsoluteLifetimeHours: 8,
    loginMaxAttempts: 3,
    loginLockoutWindowMinutes: 60,
    loginLockoutEnabled: true,
    rateLimitSettingsPerMinute: 8,
    rateLimitUploadPerMinute: 12,
    rateLimitApiPerMinute: 30,
    rateLimitSearchPerMinute: 15,
    rateLimitImportPerMinute: 3,
    rateLimitExportPerMinute: 3,
  },
};

export const SESSION_TIMEOUT_LIMITS = {
  idleMinHours: 1,
  idleMaxHours: 72,
  absoluteMinHours: 1,
  absoluteMaxHours: 168,
} as const;

export const LOGIN_LOCKOUT_LIMITS = {
  attemptsMin: 3,
  attemptsMax: 20,
  windowMinMinutes: 5,
  windowMaxMinutes: 120,
} as const;

export const RATE_LIMIT_LIMITS = {
  settingsMin: 5,
  settingsMax: 120,
  uploadMin: 5,
  uploadMax: 120,
  apiMin: 10,
  apiMax: 1000,
  searchMin: 10,
  searchMax: 300,
  importMin: 1,
  importMax: 60,
  exportMin: 1,
  exportMax: 60,
} as const;

export const WEBHOOK_RETRY_LIMITS = {
  maxRetriesMin: 1,
  maxRetriesMax: 10,
  baseDelayMinSeconds: 15,
  baseDelayMaxSeconds: 900,
} as const;
