import { eq } from "drizzle-orm";

import { withDbRetry } from "@/db/client";
import { settings } from "@/db/schema/settings";

import type { SettingsRecord } from "@/types/settings";

type SettingsRow = typeof settings.$inferSelect;

function normalizeTwitterCard(
  value: SettingsRow["defaultTwitterCard"],
): SettingsRecord["defaultTwitterCard"] {
  if (value === "summary" || value === "summary_large_image") {
    return value;
  }

  return "summary_large_image";
}

function normalizeSitemapFrequency(
  value: SettingsRow["sitemapUpdateFrequency"],
): SettingsRecord["sitemapUpdateFrequency"] {
  if (value === "hourly" || value === "daily" || value === "weekly" || value === "monthly") {
    return value;
  }

  return "daily";
}

function mapSettingsRow(row: SettingsRow): SettingsRecord {
  return {
    id: row.id,
    siteName: row.siteName,
    siteDescription: row.siteDescription,
    siteUrl: row.siteUrl,
    defaultLanguage: row.defaultLanguage,
    supportedLanguages: row.supportedLanguages as SettingsRecord["supportedLanguages"],
    fallbackLanguage: row.fallbackLanguage,
    automaticLocaleDetection: row.automaticLocaleDetection,
    browserLanguageDetection: row.browserLanguageDetection,
    languageSwitcherEnabled: row.languageSwitcherEnabled,
    localizedUrlsEnabled: row.localizedUrlsEnabled,
    rtlSupportEnabled: row.rtlSupportEnabled,
    securityLevel: row.securityLevel,
    sessionIdleTimeoutHours: row.sessionIdleTimeoutHours,
    sessionAbsoluteLifetimeHours: row.sessionAbsoluteLifetimeHours,
    loginLockoutEnabled: row.loginLockoutEnabled,
    loginMaxAttempts: row.loginMaxAttempts,
    loginLockoutWindowMinutes: row.loginLockoutWindowMinutes,
    rateLimitSettingsPerMinute: row.rateLimitSettingsPerMinute,
    rateLimitUploadPerMinute: row.rateLimitUploadPerMinute,
    rateLimitApiPerMinute: row.rateLimitApiPerMinute,
    rateLimitSearchPerMinute: row.rateLimitSearchPerMinute,
    rateLimitImportPerMinute: row.rateLimitImportPerMinute,
    rateLimitExportPerMinute: row.rateLimitExportPerMinute,
    webhookMaxRetries: row.webhookMaxRetries,
    webhookRetryBaseDelaySeconds: row.webhookRetryBaseDelaySeconds,
    auditLogLoginEnabled: row.auditLogLoginEnabled,
    auditLogFailedLoginEnabled: row.auditLogFailedLoginEnabled,
    auditLogSettingsChangeEnabled: row.auditLogSettingsChangeEnabled,
    auditLogMediaUploadEnabled: row.auditLogMediaUploadEnabled,
    auditLogSeoChangeEnabled: row.auditLogSeoChangeEnabled,
    ipAllowList: row.ipAllowList ?? [],
    ipBlockList: row.ipBlockList ?? [],
    timezone: row.timezone,
    currency: row.currency,
    logoUrl: row.logoUrl,
    faviconUrl: row.faviconUrl,
    defaultMetaTitle: row.defaultMetaTitle,
    defaultMetaDescription: row.defaultMetaDescription,
    defaultOgImage: row.defaultOgImage,
    defaultTwitterCard: normalizeTwitterCard(row.defaultTwitterCard),
    defaultIndexing: row.defaultIndexing,
    defaultFollow: row.defaultFollow,
    defaultRobots: row.defaultRobots,
    sitemapEnabled: row.sitemapEnabled,
    sitemapAutoGenerate: row.sitemapAutoGenerate,
    sitemapUpdateFrequency: normalizeSitemapFrequency(row.sitemapUpdateFrequency),
    sitemapIncludeImages: row.sitemapIncludeImages,
    sitemapIncludeVideos: row.sitemapIncludeVideos,
    robotsEnabled: row.robotsEnabled,
    robotsContent: row.robotsContent,
    theme: row.theme,
    primaryColor: row.primaryColor,
    borderRadius: row.borderRadius,
    layoutDensity: row.layoutDensity,
    headScripts: row.headScripts,
    bodyScripts: row.bodyScripts,
    footerScripts: row.footerScripts,
    allowCustomScripts: row.allowCustomScripts,
    googleAnalyticsId: row.googleAnalyticsId,
    googleTagManagerId: row.googleTagManagerId,
    googleSearchConsoleVerification: row.googleSearchConsoleVerification,
    bingWebmasterVerification: row.bingWebmasterVerification,
    facebookPixelId: row.facebookPixelId,
    maintenanceMode: row.maintenanceMode,
    debugMode: row.debugMode,
    cacheEnabled: row.cacheEnabled,
    seoAutomationEnabled: row.seoAutomationEnabled,
    autoGenerateSchemas: row.autoGenerateSchemas,
    autoGenerateMetadata: row.autoGenerateMetadata,
    developerModeEnabled: row.developerModeEnabled,
    showSqlQueries: row.showSqlQueries,
    showApiTiming: row.showApiTiming,
    showServerActions: row.showServerActions,
    mockDataEnabled: row.mockDataEnabled,
    testModeEnabled: row.testModeEnabled,
    developerToolbarEnabled: row.developerToolbarEnabled,
    verboseLoggingEnabled: row.verboseLoggingEnabled,
    backupScheduleEnabled: row.backupScheduleEnabled,
    backupScheduleHourUtc: row.backupScheduleHourUtc,
    backupRetentionMaxCount: row.backupRetentionMaxCount,
    backupEncryptionEnabled: row.backupEncryptionEnabled,
    storageProvider: row.storageProvider as SettingsRecord["storageProvider"],
    maxUploadSizeMb: row.maxUploadSizeMb,
    imageCompressionEnabled: row.imageCompressionEnabled,
    imageCompressionQuality: row.imageCompressionQuality,
    autoWebpConversion: row.autoWebpConversion,
    duplicateDetectionEnabled: row.duplicateDetectionEnabled,
    smtpHost: row.smtpHost,
    smtpPort: row.smtpPort,
    smtpUsername: row.smtpUsername,
    smtpPasswordEncrypted: row.smtpPasswordEncrypted,
    smtpEncryption: row.smtpEncryption as SettingsRecord["smtpEncryption"],
    emailSenderName: row.emailSenderName,
    emailSenderAddress: row.emailSenderAddress,
    emailReplyTo: row.emailReplyTo,
    cacheDurationSeconds: row.cacheDurationSeconds,
    cacheAutoCleanup: row.cacheAutoCleanup,
    updatedAt: row.updatedAt,
  };
}

export async function findSettings(): Promise<SettingsRecord | null> {
  return withDbRetry(async (db) => {
    const rows = await db.select().from(settings).limit(1);

    const row = rows[0];

    if (!row) {
      return null;
    }

    return mapSettingsRow(row);
  });
}

export async function findIpAccessPolicy(): Promise<{
  readonly allowList: readonly string[];
  readonly blockList: readonly string[];
}> {
  return withDbRetry(async (db) => {
    const rows = await db
      .select({
        ipAllowList: settings.ipAllowList,
        ipBlockList: settings.ipBlockList,
      })
      .from(settings)
      .limit(1);

    const row = rows[0];

    return {
      allowList: row?.ipAllowList ?? [],
      blockList: row?.ipBlockList ?? [],
    };
  });
}

export async function updateSettingsRecord(
  id: string,
  values: Partial<Omit<SettingsRow, "id" | "createdAt">>,
): Promise<SettingsRecord | null> {
  return withDbRetry(async (db) => {
    const rows = await db
      .update(settings)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(settings.id, id))
      .returning();

    const row = rows[0];

    if (!row) {
      return null;
    }

    return mapSettingsRow(row);
  });
}
