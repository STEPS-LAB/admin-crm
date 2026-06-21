import { revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";

import { SETTINGS_DATA_CACHE_SECONDS, SETTINGS_DATA_CACHE_TAG } from "@/constants/cache";
import { collectChangedFields, pickFields } from "@/lib/history/changeTracking";
import { invalidateIpAccessPolicyCache } from "@/services/ipAccessService";
import { encryptSecret } from "@/lib/security/secretEncryption";
import { sanitizeAdvancedSettings } from "@/lib/system/developerMode";
import { findSettings, updateSettingsRecord } from "@/repositories/settingsRepository";
import { recordEntityUpdate, type HistoryMutationContext } from "@/services/historyService";
import { emitWebhookEvent } from "@/services/webhookService";
import type {
  AdvancedSettingsValues,
  AppearanceSettingsValues,
  GeneralSettingsValues,
  IntegrationsSettingsValues,
  LocalizationSettingsValues,
  SeoSettingsValues,
  SecuritySettingsValues,
  SystemSettingsValues,
  BackupSettingsValues,
  CacheSettingsValues,
  EmailSettingsFormValues,
  StorageSettingsValues,
  WebhookPolicySettingsValues,
} from "@/schemas/settings/settingsSchemas";
import type { SettingsRecord } from "@/types/settings";

export interface SettingsMutationResult {
  readonly id: string;
}

export type SettingsUpdateContext = HistoryMutationContext;

const GENERAL_FIELDS = [
  "siteName",
  "siteDescription",
  "siteUrl",
  "logoUrl",
  "faviconUrl",
] as const satisfies readonly (keyof GeneralSettingsValues)[];

const LOCALIZATION_FIELDS = [
  "defaultLanguage",
  "supportedLanguages",
  "fallbackLanguage",
  "timezone",
  "currency",
  "automaticLocaleDetection",
  "browserLanguageDetection",
  "languageSwitcherEnabled",
  "localizedUrlsEnabled",
  "rtlSupportEnabled",
] as const satisfies readonly (keyof LocalizationSettingsValues)[];

const SECURITY_FIELDS = [
  "securityLevel",
  "sessionIdleTimeoutHours",
  "sessionAbsoluteLifetimeHours",
  "loginLockoutEnabled",
  "loginMaxAttempts",
  "loginLockoutWindowMinutes",
  "rateLimitSettingsPerMinute",
  "rateLimitUploadPerMinute",
  "rateLimitApiPerMinute",
  "rateLimitSearchPerMinute",
  "rateLimitImportPerMinute",
  "rateLimitExportPerMinute",
  "auditLogLoginEnabled",
  "auditLogFailedLoginEnabled",
  "auditLogSettingsChangeEnabled",
  "auditLogMediaUploadEnabled",
  "auditLogSeoChangeEnabled",
  "ipAllowList",
  "ipBlockList",
] as const satisfies readonly (keyof SecuritySettingsValues)[];

const SEO_FIELDS = [
  "defaultMetaTitle",
  "defaultMetaDescription",
  "defaultOgImage",
  "defaultTwitterCard",
  "defaultIndexing",
  "defaultFollow",
  "defaultRobots",
  "sitemapEnabled",
  "sitemapAutoGenerate",
  "sitemapUpdateFrequency",
  "sitemapIncludeImages",
  "sitemapIncludeVideos",
  "robotsEnabled",
  "robotsContent",
] as const satisfies readonly (keyof SeoSettingsValues)[];

const APPEARANCE_FIELDS = [
  "theme",
  "primaryColor",
  "borderRadius",
  "layoutDensity",
] as const satisfies readonly (keyof AppearanceSettingsValues)[];

const INTEGRATIONS_FIELDS = [
  "googleAnalyticsId",
  "googleTagManagerId",
  "googleSearchConsoleVerification",
  "bingWebmasterVerification",
  "facebookPixelId",
] as const satisfies readonly (keyof IntegrationsSettingsValues)[];

const SYSTEM_FIELDS = [
  "maintenanceMode",
  "debugMode",
  "cacheEnabled",
  "seoAutomationEnabled",
  "autoGenerateSchemas",
  "autoGenerateMetadata",
  "allowCustomScripts",
  "headScripts",
  "bodyScripts",
  "footerScripts",
] as const satisfies readonly (keyof SystemSettingsValues)[];

const ADVANCED_FIELDS = [
  "developerModeEnabled",
  "showSqlQueries",
  "showApiTiming",
  "showServerActions",
  "mockDataEnabled",
  "testModeEnabled",
  "developerToolbarEnabled",
  "verboseLoggingEnabled",
] as const satisfies readonly (keyof AdvancedSettingsValues)[];

const WEBHOOK_POLICY_FIELDS = [
  "webhookMaxRetries",
  "webhookRetryBaseDelaySeconds",
] as const satisfies readonly (keyof WebhookPolicySettingsValues)[];

const BACKUP_FIELDS = [
  "backupScheduleEnabled",
  "backupScheduleHourUtc",
  "backupRetentionMaxCount",
  "backupEncryptionEnabled",
] as const satisfies readonly (keyof BackupSettingsValues)[];

const STORAGE_FIELDS = [
  "storageProvider",
  "maxUploadSizeMb",
  "imageCompressionEnabled",
  "imageCompressionQuality",
  "autoWebpConversion",
  "duplicateDetectionEnabled",
] as const satisfies readonly (keyof StorageSettingsValues)[];

const EMAIL_FIELDS = [
  "smtpHost",
  "smtpPort",
  "smtpUsername",
  "smtpEncryption",
  "emailSenderName",
  "emailSenderAddress",
  "emailReplyTo",
] as const;

const CACHE_FIELDS = [
  "cacheEnabled",
  "cacheDurationSeconds",
  "cacheAutoCleanup",
] as const satisfies readonly (keyof CacheSettingsValues)[];

async function loadSettingsRecord(): Promise<SettingsRecord> {
  const settings = await findSettings();

  if (!settings) {
    throw new Error("Settings record not found");
  }

  return settings;
}

const getSettingsCachedAcrossRequests = unstable_cache(
  loadSettingsRecord,
  ["app-settings-record"],
  {
    tags: [SETTINGS_DATA_CACHE_TAG],
    revalidate: SETTINGS_DATA_CACHE_SECONDS,
  },
);

const getSettingsPerRequest = cache(getSettingsCachedAcrossRequests);

async function requireSettings(): Promise<SettingsRecord> {
  return getSettingsPerRequest();
}

function invalidateSettingsCache(): void {
  revalidateTag(SETTINGS_DATA_CACHE_TAG);
}

async function shouldRecordSettingsAudit(section: string, settingsId: string): Promise<boolean> {
  if (section === "security") {
    return true;
  }

  const settings = await findSettings();

  if (!settings || settings.id !== settingsId) {
    return true;
  }

  return settings.auditLogSettingsChangeEnabled;
}

async function persistSettingsUpdate<T extends Record<string, unknown>>(
  section: string,
  fields: readonly string[],
  input: T,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  const current = await requireSettings();
  const before = pickFields(current as unknown as Record<string, unknown>, fields);
  const updated = await updateSettingsRecord(current.id, input);

  if (!updated) {
    throw new Error("Failed to update settings");
  }

  const after = pickFields(updated as unknown as Record<string, unknown>, fields);
  const changedFields = collectChangedFields(before, after);

  if (changedFields.length > 0) {
    const shouldAudit = await shouldRecordSettingsAudit(section, current.id);

    if (shouldAudit) {
      await recordEntityUpdate(
        "settings",
        current.id,
        `Updated ${section} settings`,
        before,
        after,
        context,
      );
    }

    emitWebhookEvent("settings.updated", {
      section,
      changedFields,
      settingsId: current.id,
    });

    invalidateSettingsCache();
  }

  return { id: updated.id };
}

export async function getSettings(): Promise<SettingsRecord> {
  return requireSettings();
}

export async function updateGeneralSettings(
  input: GeneralSettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  return persistSettingsUpdate("general", GENERAL_FIELDS, input, context);
}

export async function updateLocalizationSettings(
  input: LocalizationSettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  return persistSettingsUpdate("localization", LOCALIZATION_FIELDS, input, context);
}

export async function updateSecuritySettings(
  input: SecuritySettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  const result = await persistSettingsUpdate("security", SECURITY_FIELDS, input, context);
  invalidateIpAccessPolicyCache();
  return result;
}

export async function updateSeoSettings(
  input: SeoSettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  return persistSettingsUpdate("SEO", SEO_FIELDS, input, context);
}

export async function updateAppearanceSettings(
  input: AppearanceSettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  return persistSettingsUpdate("appearance", APPEARANCE_FIELDS, input, context);
}

export async function updateIntegrationsSettings(
  input: IntegrationsSettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  return persistSettingsUpdate("integrations", INTEGRATIONS_FIELDS, input, context);
}

export async function updateSystemSettings(
  input: SystemSettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  return persistSettingsUpdate("system", SYSTEM_FIELDS, input, context);
}

export async function updateAdvancedSettings(
  input: AdvancedSettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  const sanitized = sanitizeAdvancedSettings(input);
  return persistSettingsUpdate("advanced", ADVANCED_FIELDS, sanitized, context);
}

export async function updateWebhookPolicySettings(
  input: WebhookPolicySettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  return persistSettingsUpdate("webhook-policy", WEBHOOK_POLICY_FIELDS, input, context);
}

export async function updateBackupSettings(
  input: BackupSettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  return persistSettingsUpdate("backup", BACKUP_FIELDS, input, context);
}

export async function updateStorageSettings(
  input: StorageSettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  return persistSettingsUpdate("storage", STORAGE_FIELDS, input, context);
}

export async function updateEmailSettings(
  input: EmailSettingsFormValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  const current = await requireSettings();
  const before = pickFields(current as unknown as Record<string, unknown>, EMAIL_FIELDS);

  const payload: Record<string, unknown> = {
    smtpHost: input.smtpHost,
    smtpPort: input.smtpPort,
    smtpUsername: input.smtpUsername,
    smtpEncryption: input.smtpEncryption,
    emailSenderName: input.emailSenderName,
    emailSenderAddress: input.emailSenderAddress,
    emailReplyTo: input.emailReplyTo,
  };

  if (input.smtpPassword && input.smtpPassword.trim().length > 0) {
    payload.smtpPasswordEncrypted = encryptSecret(input.smtpPassword.trim());
  }

  const updated = await updateSettingsRecord(current.id, payload);

  if (!updated) {
    throw new Error("Failed to update settings");
  }

  const after = pickFields(updated as unknown as Record<string, unknown>, EMAIL_FIELDS);
  const changedFields = collectChangedFields(before, after);

  if (input.smtpPassword && input.smtpPassword.trim().length > 0) {
    changedFields.push("smtpPasswordEncrypted");
  }

  if (changedFields.length > 0) {
    const shouldAudit = await shouldRecordSettingsAudit("email", current.id);

    if (shouldAudit) {
      await recordEntityUpdate(
        "settings",
        current.id,
        "Updated email settings",
        before,
        after,
        context,
      );
    }

    emitWebhookEvent("settings.updated", {
      section: "email",
      changedFields,
      settingsId: current.id,
    });
  }

  return { id: updated.id };
}

export async function updateCacheSettings(
  input: CacheSettingsValues,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  return persistSettingsUpdate("cache", CACHE_FIELDS, input, context);
}

export async function updateRobotsContent(
  robotsContent: string,
  context: SettingsUpdateContext,
): Promise<SettingsMutationResult> {
  return persistSettingsUpdate("robots", ["robotsContent"], { robotsContent }, context);
}
