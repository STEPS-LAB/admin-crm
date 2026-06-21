export const BACKUP_STORAGE_BUCKET = "backups";

export const BACKUP_MANIFEST_VERSION = "1.0";

export const BACKUP_TYPES = ["metadata", "full"] as const;

export type BackupType = (typeof BACKUP_TYPES)[number];

export const BACKUP_TRIGGERS = ["manual", "scheduled", "pre_restore"] as const;

export type BackupTrigger = (typeof BACKUP_TRIGGERS)[number];

export const BACKUP_VALIDATION_STATUSES = ["pending", "valid", "warning", "invalid"] as const;

export type BackupValidationStatus = (typeof BACKUP_VALIDATION_STATUSES)[number];

export const RESTORE_SCOPES = [
  "settings",
  "redirects",
  "seo_templates",
  "feature_flags",
] as const;

export type RestoreScope = (typeof RESTORE_SCOPES)[number];

export const RESTORE_SCOPE_LABELS: Record<RestoreScope, string> = {
  settings: "Site settings",
  redirects: "Redirect rules",
  seo_templates: "SEO templates",
  feature_flags: "Feature flags",
};

export const BACKUP_RETENTION_LIMITS = {
  minCount: 5,
  maxCount: 365,
  scheduleHourMin: 0,
  scheduleHourMax: 23,
} as const;

export const BACKUP_MAX_ARCHIVE_BYTES = 50 * 1024 * 1024;
