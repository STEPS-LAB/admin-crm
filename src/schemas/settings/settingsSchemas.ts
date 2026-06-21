import { z } from "zod";

import { BACKUP_RETENTION_LIMITS } from "@/constants/backup";
import {
  BORDER_RADIUS_OPTIONS,
  CURRENCY_OPTIONS,
  LAYOUT_DENSITY_OPTIONS,
  SITEMAP_FREQUENCY_OPTIONS,
  SUPPORTED_LANGUAGES,
  THEME_OPTIONS,
  TIMEZONE_OPTIONS,
  TWITTER_CARD_OPTIONS,
} from "@/constants/settings";
import {
  LOGIN_LOCKOUT_LIMITS,
  RATE_LIMIT_LIMITS,
  SECURITY_LEVELS,
  SESSION_TIMEOUT_LIMITS,
  WEBHOOK_RETRY_LIMITS,
} from "@/constants/security-settings";
import { validateIpList } from "@/lib/security/ipList";

const optionalUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

const optionalText = z
  .string()
  .trim()
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

export const supportedLanguageSchema = z.enum(SUPPORTED_LANGUAGES);

export type SupportedLanguage = z.infer<typeof supportedLanguageSchema>;

export const themeOptionSchema = z.enum(THEME_OPTIONS);

export type ThemeOption = z.infer<typeof themeOptionSchema>;

export const layoutDensityOptionSchema = z.enum(LAYOUT_DENSITY_OPTIONS);

export type LayoutDensityOption = z.infer<typeof layoutDensityOptionSchema>;

export const twitterCardOptionSchema = z.enum(TWITTER_CARD_OPTIONS);

export type TwitterCardOption = z.infer<typeof twitterCardOptionSchema>;

export const sitemapFrequencyOptionSchema = z.enum(SITEMAP_FREQUENCY_OPTIONS);

export type SitemapFrequencyOption = z.infer<typeof sitemapFrequencyOptionSchema>;

export const generalSettingsSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required").max(120),
  siteDescription: optionalText.pipe(z.string().max(1000).nullable()),
  siteUrl: z.string().trim().url("Site URL must be valid"),
  logoUrl: optionalUrl,
  faviconUrl: optionalUrl,
});

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

export const localizationSettingsSchema = z
  .object({
    defaultLanguage: supportedLanguageSchema,
    supportedLanguages: z
      .array(supportedLanguageSchema)
      .min(1, "At least one language is required"),
    fallbackLanguage: supportedLanguageSchema,
    timezone: z.enum(TIMEZONE_OPTIONS),
    currency: z.enum(CURRENCY_OPTIONS),
    automaticLocaleDetection: z.coerce.boolean(),
    browserLanguageDetection: z.coerce.boolean(),
    languageSwitcherEnabled: z.coerce.boolean(),
    localizedUrlsEnabled: z.coerce.boolean(),
    rtlSupportEnabled: z.coerce.boolean(),
  })
  .refine((data) => data.supportedLanguages.includes(data.defaultLanguage), {
    message: "Default language must be included in supported languages",
    path: ["defaultLanguage"],
  })
  .refine((data) => data.supportedLanguages.includes(data.fallbackLanguage), {
    message: "Fallback language must be included in supported languages",
    path: ["fallbackLanguage"],
  });

export type LocalizationSettingsValues = z.infer<typeof localizationSettingsSchema>;

export const seoSettingsSchema = z.object({
  defaultMetaTitle: optionalText.pipe(z.string().max(255).nullable()),
  defaultMetaDescription: optionalText.pipe(z.string().max(500).nullable()),
  defaultOgImage: optionalUrl,
  defaultTwitterCard: twitterCardOptionSchema,
  defaultIndexing: z.coerce.boolean(),
  defaultFollow: z.coerce.boolean(),
  defaultRobots: z.string().trim().min(1).max(255),
  sitemapEnabled: z.coerce.boolean(),
  sitemapAutoGenerate: z.coerce.boolean(),
  sitemapUpdateFrequency: sitemapFrequencyOptionSchema,
  sitemapIncludeImages: z.coerce.boolean(),
  sitemapIncludeVideos: z.coerce.boolean(),
  robotsEnabled: z.coerce.boolean(),
  robotsContent: optionalText.pipe(z.string().max(10000).nullable()),
});

export type SeoSettingsValues = z.infer<typeof seoSettingsSchema>;

const hexColorPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const appearanceSettingsSchema = z.object({
  theme: themeOptionSchema,
  primaryColor: z
    .string()
    .trim()
    .regex(hexColorPattern, "Must be a valid hex color")
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value)),
  borderRadius: z.coerce
    .number()
    .int()
    .refine((value) => BORDER_RADIUS_OPTIONS.includes(value as (typeof BORDER_RADIUS_OPTIONS)[number]), {
      message: "Invalid border radius",
    }),
  layoutDensity: layoutDensityOptionSchema,
});

export type AppearanceSettingsValues = z.infer<typeof appearanceSettingsSchema>;

export const integrationsSettingsSchema = z.object({
  googleAnalyticsId: optionalText.pipe(z.string().max(64).nullable()),
  googleTagManagerId: optionalText.pipe(z.string().max(64).nullable()),
  googleSearchConsoleVerification: optionalText.pipe(z.string().max(256).nullable()),
  bingWebmasterVerification: optionalText.pipe(z.string().max(256).nullable()),
  facebookPixelId: optionalText.pipe(z.string().max(64).nullable()),
});

export type IntegrationsSettingsValues = z.infer<typeof integrationsSettingsSchema>;

const scriptField = z
  .string()
  .trim()
  .max(50000)
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

export const systemSettingsSchema = z
  .object({
    maintenanceMode: z.coerce.boolean(),
    debugMode: z.coerce.boolean(),
    cacheEnabled: z.coerce.boolean(),
    seoAutomationEnabled: z.coerce.boolean(),
    autoGenerateSchemas: z.coerce.boolean(),
    autoGenerateMetadata: z.coerce.boolean(),
    allowCustomScripts: z.coerce.boolean(),
    headScripts: scriptField,
    bodyScripts: scriptField,
    footerScripts: scriptField,
  })
  .superRefine((data, context) => {
    if (data.allowCustomScripts) {
      return;
    }

    const scriptFields = ["headScripts", "bodyScripts", "footerScripts"] as const;

    for (const field of scriptFields) {
      if (data[field]) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Custom scripts require enabling script injection",
          path: [field],
        });
      }
    }
  });

export type SystemSettingsValues = z.infer<typeof systemSettingsSchema>;

const securitySettingsFields = z.object({
  securityLevel: z.enum(SECURITY_LEVELS),
  sessionIdleTimeoutHours: z.coerce
    .number()
    .int()
    .min(SESSION_TIMEOUT_LIMITS.idleMinHours)
    .max(SESSION_TIMEOUT_LIMITS.idleMaxHours),
  sessionAbsoluteLifetimeHours: z.coerce
    .number()
    .int()
    .min(SESSION_TIMEOUT_LIMITS.absoluteMinHours)
    .max(SESSION_TIMEOUT_LIMITS.absoluteMaxHours),
  loginLockoutEnabled: z.coerce.boolean(),
  loginMaxAttempts: z.coerce
    .number()
    .int()
    .min(LOGIN_LOCKOUT_LIMITS.attemptsMin)
    .max(LOGIN_LOCKOUT_LIMITS.attemptsMax),
  loginLockoutWindowMinutes: z.coerce
    .number()
    .int()
    .min(LOGIN_LOCKOUT_LIMITS.windowMinMinutes)
    .max(LOGIN_LOCKOUT_LIMITS.windowMaxMinutes),
  rateLimitSettingsPerMinute: z.coerce
    .number()
    .int()
    .min(RATE_LIMIT_LIMITS.settingsMin)
    .max(RATE_LIMIT_LIMITS.settingsMax),
  rateLimitUploadPerMinute: z.coerce
    .number()
    .int()
    .min(RATE_LIMIT_LIMITS.uploadMin)
    .max(RATE_LIMIT_LIMITS.uploadMax),
  rateLimitApiPerMinute: z.coerce
    .number()
    .int()
    .min(RATE_LIMIT_LIMITS.apiMin)
    .max(RATE_LIMIT_LIMITS.apiMax),
  rateLimitSearchPerMinute: z.coerce
    .number()
    .int()
    .min(RATE_LIMIT_LIMITS.searchMin)
    .max(RATE_LIMIT_LIMITS.searchMax),
  rateLimitImportPerMinute: z.coerce
    .number()
    .int()
    .min(RATE_LIMIT_LIMITS.importMin)
    .max(RATE_LIMIT_LIMITS.importMax),
  rateLimitExportPerMinute: z.coerce
    .number()
    .int()
    .min(RATE_LIMIT_LIMITS.exportMin)
    .max(RATE_LIMIT_LIMITS.exportMax),
  auditLogLoginEnabled: z.coerce.boolean(),
  auditLogFailedLoginEnabled: z.coerce.boolean(),
  auditLogSettingsChangeEnabled: z.coerce.boolean(),
  auditLogMediaUploadEnabled: z.coerce.boolean(),
  auditLogSeoChangeEnabled: z.coerce.boolean(),
  ipAllowList: z.string().trim(),
  ipBlockList: z.string().trim(),
});

function refineSecuritySettings(
  data: z.infer<typeof securitySettingsFields>,
  context: z.RefinementCtx,
): void {
  const allowList = data.ipAllowList
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const blockList = data.ipBlockList
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const allowListError = validateIpList(allowList);

  if (allowListError) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: allowListError,
      path: ["ipAllowList"],
    });
  }

  const blockListError = validateIpList(blockList);

  if (blockListError) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: blockListError,
      path: ["ipBlockList"],
    });
  }

  if (data.sessionIdleTimeoutHours > data.sessionAbsoluteLifetimeHours) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Idle timeout cannot exceed absolute session lifetime",
      path: ["sessionIdleTimeoutHours"],
    });
  }
}

export const securitySettingsFormSchema = securitySettingsFields.superRefine(refineSecuritySettings);

export const securitySettingsSchema = securitySettingsFormSchema.transform((data) => ({
  ...data,
  ipAllowList: data.ipAllowList
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean),
  ipBlockList: data.ipBlockList
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean),
}));

export type SecuritySettingsFormValues = z.infer<typeof securitySettingsFormSchema>;
export type SecuritySettingsValues = z.output<typeof securitySettingsSchema>;

const developerOption = z.coerce.boolean();

export const advancedSettingsSchema = z
  .object({
    developerModeEnabled: developerOption,
    showSqlQueries: developerOption,
    showApiTiming: developerOption,
    showServerActions: developerOption,
    mockDataEnabled: developerOption,
    testModeEnabled: developerOption,
    developerToolbarEnabled: developerOption,
    verboseLoggingEnabled: developerOption,
  })
  .superRefine((data, context) => {
    if (data.developerModeEnabled) {
      return;
    }

    const dependentFields = [
      "showSqlQueries",
      "showApiTiming",
      "showServerActions",
      "mockDataEnabled",
      "testModeEnabled",
      "developerToolbarEnabled",
      "verboseLoggingEnabled",
    ] as const;

    for (const field of dependentFields) {
      if (data[field]) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enable developer mode before turning on diagnostics",
          path: [field],
        });
      }
    }
  });

export type AdvancedSettingsValues = z.infer<typeof advancedSettingsSchema>;

export const webhookPolicySettingsSchema = z.object({
  webhookMaxRetries: z.coerce
    .number()
    .int()
    .min(WEBHOOK_RETRY_LIMITS.maxRetriesMin)
    .max(WEBHOOK_RETRY_LIMITS.maxRetriesMax),
  webhookRetryBaseDelaySeconds: z.coerce
    .number()
    .int()
    .min(WEBHOOK_RETRY_LIMITS.baseDelayMinSeconds)
    .max(WEBHOOK_RETRY_LIMITS.baseDelayMaxSeconds),
});

export type WebhookPolicySettingsValues = z.infer<typeof webhookPolicySettingsSchema>;

export const backupSettingsSchema = z.object({
  backupScheduleEnabled: z.coerce.boolean(),
  backupScheduleHourUtc: z.coerce
    .number()
    .int()
    .min(BACKUP_RETENTION_LIMITS.scheduleHourMin)
    .max(BACKUP_RETENTION_LIMITS.scheduleHourMax),
  backupRetentionMaxCount: z.coerce
    .number()
    .int()
    .min(BACKUP_RETENTION_LIMITS.minCount)
    .max(BACKUP_RETENTION_LIMITS.maxCount),
  backupEncryptionEnabled: z.coerce.boolean(),
});

export type BackupSettingsValues = z.infer<typeof backupSettingsSchema>;

export const storageSettingsSchema = z.object({
  storageProvider: z.enum(["supabase"] as const),
  maxUploadSizeMb: z.coerce
    .number()
    .int()
    .min(1)
    .max(500),
  imageCompressionEnabled: z.coerce.boolean(),
  imageCompressionQuality: z.coerce.number().int().min(40).max(100),
  autoWebpConversion: z.coerce.boolean(),
  duplicateDetectionEnabled: z.coerce.boolean(),
});

export type StorageSettingsValues = z.infer<typeof storageSettingsSchema>;

export const emailSettingsFormSchema = z.object({
  smtpHost: optionalText.pipe(z.string().max(255).nullable()),
  smtpPort: z.coerce.number().int().min(1).max(65535),
  smtpUsername: optionalText.pipe(z.string().max(255).nullable()),
  smtpPassword: z.string().optional(),
  smtpEncryption: z.enum(["tls", "ssl", "none"] as const),
  emailSenderName: optionalText.pipe(z.string().max(120).nullable()),
  emailSenderAddress: z
    .string()
    .trim()
    .email("Sender email must be valid")
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value)),
  emailReplyTo: z
    .string()
    .trim()
    .email("Reply-to must be valid")
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value)),
});

export type EmailSettingsFormValues = z.infer<typeof emailSettingsFormSchema>;

export const cacheSettingsSchema = z.object({
  cacheEnabled: z.coerce.boolean(),
  cacheDurationSeconds: z.coerce.number().int().min(60).max(86_400),
  cacheAutoCleanup: z.coerce.boolean(),
});

export type CacheSettingsValues = z.infer<typeof cacheSettingsSchema>;

export const sendTestEmailSchema = z.object({
  recipient: z.string().trim().email("Enter a valid recipient email"),
});
