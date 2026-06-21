import { describe, expect, it } from "vitest";

import { resolvePublicSiteLanguage } from "@/lib/public-site/language";
import {
  parseAcceptLanguageHeader,
  resolveDetectedPublicLanguage,
} from "@/lib/public-site/localeDetection";

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
    automaticLocaleDetection: true,
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

describe("resolvePublicSiteLanguage", () => {
  it("returns requested language when supported", () => {
    expect(resolvePublicSiteLanguage("en", "uk", ["uk", "en"])).toBe("en");
  });

  it("falls back when request is unsupported", () => {
    expect(resolvePublicSiteLanguage("en", "uk", ["uk"], "uk")).toBe("uk");
  });

  it("falls back to uk when default is unsupported", () => {
    expect(resolvePublicSiteLanguage(undefined, "fr" as "uk", ["uk"])).toBe("uk");
  });
});

describe("locale detection", () => {
  it("parses accept-language header", () => {
    expect(parseAcceptLanguageHeader("en-US,en;q=0.9,uk;q=0.8")).toBe("en");
    expect(parseAcceptLanguageHeader("uk-UA,uk;q=0.9")).toBe("uk");
  });

  it("detects browser language when enabled", () => {
    const settings = buildSettings();

    expect(resolveDetectedPublicLanguage(settings, "en-US,en;q=0.9")).toBe("en");
  });

  it("uses default language when detection is disabled", () => {
    const settings = buildSettings({ automaticLocaleDetection: false });

    expect(resolveDetectedPublicLanguage(settings, "en-US,en;q=0.9")).toBe("uk");
  });
});
