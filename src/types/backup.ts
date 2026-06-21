import type {
  BackupTrigger,
  BackupType,
  BackupValidationStatus,
  RestoreScope,
} from "@/constants/backup";

export type BackupStatus = "pending" | "in_progress" | "completed" | "failed";

export interface BackupRecordSummary {
  readonly id: string;
  readonly status: BackupStatus;
  readonly backupType: BackupType;
  readonly triggeredBy: BackupTrigger;
  readonly encrypted: boolean;
  readonly validationStatus: BackupValidationStatus;
  readonly isProtected: boolean;
  readonly manifestVersion: string | null;
  readonly storagePath: string | null;
  readonly fileSize: number | null;
  readonly checksum: string | null;
  readonly metadata: Record<string, unknown> | null;
  readonly errorMessage: string | null;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly createdAt: Date;
}

export interface BackupOverview {
  readonly latestBackup: BackupRecordSummary | null;
  readonly totalBackups: number;
  readonly completedCount: number;
  readonly failedCount: number;
  readonly totalStorageBytes: number;
  readonly scheduleEnabled: boolean;
  readonly scheduleHourUtc: number;
  readonly retentionMaxCount: number;
  readonly encryptionEnabled: boolean;
}

export interface BackupCompletionPayload {
  readonly id: string;
  readonly status: BackupStatus;
  readonly backupType: BackupType;
  readonly storagePath: string | null;
  readonly fileSize: number | null;
  readonly checksum: string | null;
  readonly completedAt: string | null;
  readonly metadata: Record<string, unknown> | null;
}

export interface BackupManifest {
  readonly version: string;
  readonly generatedAt: string;
  readonly backupType: BackupType;
  readonly parts: readonly string[];
  readonly payloadChecksum: string;
}

export interface BackupSnapshotPayload {
  readonly manifest: BackupManifest;
  readonly settings: Record<string, unknown> | null;
  readonly redirectRules: readonly Record<string, unknown>[];
  readonly seoTemplates: readonly Record<string, unknown>[];
  readonly featureFlagInstallations: readonly Record<string, unknown>[];
  readonly sitemapConfig: readonly Record<string, unknown>[];
  readonly robotsConfig: readonly Record<string, unknown>[];
  readonly counts?: Record<string, number>;
}

export interface RestoreScopePreview {
  readonly scope: RestoreScope;
  readonly label: string;
  readonly willCreate: number;
  readonly willUpdate: number;
  readonly willSkip: number;
  readonly warnings: readonly string[];
}

export interface RestorePreviewResult {
  readonly backupId: string;
  readonly backupType: BackupType;
  readonly manifestVersion: string;
  readonly scopes: readonly RestoreScopePreview[];
  readonly canRestore: boolean;
  readonly estimatedDurationSeconds: number;
}

export interface RestoreExecutionResult {
  readonly backupId: string;
  readonly safetyBackupId: string;
  readonly scopes: readonly RestoreScope[];
  readonly restoredAt: string;
}

export interface BackupValidationResult {
  readonly backupId: string;
  readonly status: BackupValidationStatus;
  readonly checksumValid: boolean;
  readonly manifestValid: boolean;
  readonly warnings: readonly string[];
}
