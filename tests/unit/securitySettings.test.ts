import { describe, expect, it } from "vitest";

import { isIpAllowed, resolveLoginRateLimitPolicy, isSessionExpired } from "@/lib/security/securityPolicy";
import { isValidIpEntry, validateIpList } from "@/lib/security/ipList";
import { securitySettingsSchema } from "@/schemas/settings/settingsSchemas";

import type { SettingsRecord } from "@/types/settings";

function buildSettings(overrides: Partial<SettingsRecord> = {}): SettingsRecord {
  return {
    id: "settings-id",
    siteName: "SEO CMS",
    siteDescription: null,
    siteUrl: "https://example.com",
    defaultLanguage: "uk",
    supportedLanguages: ["uk", "en"],
    fallbackLanguage: "en",
    automaticLocaleDetection: false,
    browserLanguageDetection: true,
    languageSwitcherEnabled: true,
    localizedUrlsEnabled: true,
    rtlSupportEnabled: false,
    securityLevel: "standard",
    sessionIdleTimeoutHours: 8,
    sessionAbsoluteLifetimeHours: 24,
    loginLockoutEnabled: true,
    loginMaxAttempts: 5,
    loginLockoutWindowMinutes: 15,
    rateLimitSettingsPerMinute: 20,
    rateLimitUploadPerMinute: 30,
    rateLimitApiPerMinute: 100,
    rateLimitSearchPerMinute: 60,
    rateLimitImportPerMinute: 10,
    rateLimitExportPerMinute: 10,
    webhookMaxRetries: 5,
    webhookRetryBaseDelaySeconds: 60,
    auditLogLoginEnabled: true,
    auditLogFailedLoginEnabled: true,
    auditLogSettingsChangeEnabled: true,
    auditLogMediaUploadEnabled: true,
    auditLogSeoChangeEnabled: true,
    ipAllowList: [],
    ipBlockList: [],
    timezone: "Europe/Kyiv",
    currency: "UAH",
    logoUrl: null,
    faviconUrl: null,
    defaultMetaTitle: null,
    defaultMetaDescription: null,
    defaultOgImage: null,
    defaultTwitterCard: "summary_large_image",
    defaultIndexing: true,
    defaultFollow: true,
    defaultRobots: "index, follow",
    sitemapEnabled: true,
    sitemapAutoGenerate: true,
    sitemapUpdateFrequency: "daily",
    sitemapIncludeImages: true,
    sitemapIncludeVideos: false,
    robotsEnabled: true,
    robotsContent: null,
    theme: "system",
    primaryColor: null,
    borderRadius: 8,
    layoutDensity: "comfortable",
    headScripts: null,
    bodyScripts: null,
    footerScripts: null,
    allowCustomScripts: false,
    googleAnalyticsId: null,
    googleTagManagerId: null,
    googleSearchConsoleVerification: null,
    bingWebmasterVerification: null,
    facebookPixelId: null,
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    seoAutomationEnabled: true,
    autoGenerateSchemas: true,
    autoGenerateMetadata: true,
    developerModeEnabled: false,
    showSqlQueries: false,
    showApiTiming: false,
    showServerActions: false,
    mockDataEnabled: false,
    testModeEnabled: false,
    developerToolbarEnabled: false,
    verboseLoggingEnabled: false,
    backupScheduleEnabled: false,
    backupScheduleHourUtc: 3,
    backupRetentionMaxCount: 30,
    backupEncryptionEnabled: true,
    storageProvider: "supabase",
    maxUploadSizeMb: 25,
    imageCompressionEnabled: true,
    imageCompressionQuality: 80,
    autoWebpConversion: true,
    duplicateDetectionEnabled: true,
    smtpHost: null,
    smtpPort: 587,
    smtpUsername: null,
    smtpPasswordEncrypted: null,
    smtpEncryption: "tls",
    emailSenderName: null,
    emailSenderAddress: null,
    emailReplyTo: null,
    cacheDurationSeconds: 3600,
    cacheAutoCleanup: true,
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("securitySettingsSchema", () => {
  it("accepts valid security settings", () => {
    const result = securitySettingsSchema.safeParse({
      securityLevel: "enhanced",
      sessionIdleTimeoutHours: 4,
      sessionAbsoluteLifetimeHours: 12,
      loginLockoutEnabled: true,
      loginMaxAttempts: 5,
      loginLockoutWindowMinutes: 30,
      rateLimitSettingsPerMinute: 12,
      rateLimitUploadPerMinute: 20,
      rateLimitApiPerMinute: 60,
      rateLimitSearchPerMinute: 30,
      rateLimitImportPerMinute: 6,
      rateLimitExportPerMinute: 6,
      auditLogLoginEnabled: true,
      auditLogFailedLoginEnabled: true,
      auditLogSettingsChangeEnabled: true,
      auditLogMediaUploadEnabled: true,
      auditLogSeoChangeEnabled: true,
      ipAllowList: "203.0.113.10",
      ipBlockList: "",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.ipAllowList).toEqual(["203.0.113.10"]);
    }
  });

  it("rejects idle timeout above absolute lifetime", () => {
    const result = securitySettingsSchema.safeParse({
      securityLevel: "standard",
      sessionIdleTimeoutHours: 24,
      sessionAbsoluteLifetimeHours: 8,
      loginLockoutEnabled: true,
      loginMaxAttempts: 5,
      loginLockoutWindowMinutes: 15,
      rateLimitSettingsPerMinute: 20,
      rateLimitUploadPerMinute: 30,
      rateLimitApiPerMinute: 100,
    rateLimitSearchPerMinute: 60,
    rateLimitImportPerMinute: 10,
    rateLimitExportPerMinute: 10,
      auditLogLoginEnabled: true,
      auditLogFailedLoginEnabled: true,
      auditLogSettingsChangeEnabled: true,
      auditLogMediaUploadEnabled: true,
      auditLogSeoChangeEnabled: true,
      ipAllowList: "",
      ipBlockList: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("security policy", () => {
  it("resolves login rate limit policy", () => {
    const settings = buildSettings();

    expect(resolveLoginRateLimitPolicy(settings)).toEqual({
      enabled: true,
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
    });
  });

  it("blocks listed IPs", () => {
    const settings = buildSettings({ ipBlockList: ["192.0.2.1"] });

    expect(isIpAllowed("192.0.2.1", settings)).toBe(false);
    expect(isIpAllowed("203.0.113.10", settings)).toBe(true);
  });

  it("enforces allow list when configured", () => {
    const settings = buildSettings({ ipAllowList: ["203.0.113.10"] });

    expect(isIpAllowed("203.0.113.10", settings)).toBe(true);
    expect(isIpAllowed("198.51.100.4", settings)).toBe(false);
  });

  it("expires idle sessions", () => {
    const settings = buildSettings();
    const now = Date.now();

    expect(
      isSessionExpired(
        {
          createdAt: new Date(now - 60 * 60 * 1000),
          lastActivity: new Date(now - 9 * 60 * 60 * 1000),
          expiresAt: new Date(now + 24 * 60 * 60 * 1000),
        },
        settings,
        false,
      ),
    ).toBe(true);
  });

  it("extends idle timeout when remember me is enabled", () => {
    const settings = buildSettings();
    const now = Date.now();

    expect(
      isSessionExpired(
        {
          createdAt: new Date(now - 60 * 60 * 1000),
          lastActivity: new Date(now - 9 * 60 * 60 * 1000),
          expiresAt: new Date(now + 24 * 60 * 60 * 1000),
        },
        settings,
        true,
      ),
    ).toBe(false);
  });
});

describe("ip list validation", () => {
  it("validates IPv4 entries", () => {
    expect(isValidIpEntry("203.0.113.10")).toBe(true);
    expect(validateIpList(["203.0.113.10"])).toBeNull();
    expect(validateIpList(["not-an-ip"])).toBeTruthy();
  });
});
