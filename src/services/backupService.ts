import {
  BACKUP_MAX_ARCHIVE_BYTES,
  BACKUP_STORAGE_BUCKET,
  type BackupTrigger,
  type BackupType,
} from "@/constants/backup";
import {
  parseBackupArchive,
  serializeBackupSnapshot,
  validateBackupArchiveChecksum,
} from "@/lib/backup/archive";
import {
  completeBackupRecord,
  deleteBackupRecord,
  deleteBackupRecords,
  failBackupRecord,
  findBackupOverviewStats,
  findBackupRecordById,
  findBackupRecords,
  findExpiredBackupIds,
  findLatestScheduledBackupToday,
  insertBackupRecord,
  setBackupProtection,
  updateBackupValidationStatus,
} from "@/repositories/backupRepository";
import { collectBackupSnapshot } from "@/repositories/backupSnapshotRepository";
import { findSettings } from "@/repositories/settingsRepository";
import { downloadObject, removeObject, uploadObject } from "@/repositories/storageRepository";
import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";
import { createNotification } from "@/services/notificationService";
import { emitWebhookEvent } from "@/services/webhookService";

import type {
  BackupCompletionPayload,
  BackupOverview,
  BackupRecordSummary,
  BackupValidationResult,
} from "@/types/backup";
import type { HistoryMutationContext } from "@/services/historyService";

function mapBackupSummary(record: {
  id: string;
  status: BackupRecordSummary["status"];
  backupType: BackupType;
  triggeredBy: BackupTrigger;
  encrypted: boolean;
  validationStatus: BackupRecordSummary["validationStatus"];
  isProtected: boolean;
  manifestVersion: string | null;
  storagePath: string | null;
  fileSize: number | null;
  checksum: string | null;
  metadata: Record<string, unknown> | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}): BackupRecordSummary {
  return {
    id: record.id,
    status: record.status,
    backupType: record.backupType,
    triggeredBy: record.triggeredBy,
    encrypted: record.encrypted,
    validationStatus: record.validationStatus,
    isProtected: record.isProtected,
    manifestVersion: record.manifestVersion,
    storagePath: record.storagePath,
    fileSize: record.fileSize,
    checksum: record.checksum,
    metadata: record.metadata,
    errorMessage: record.errorMessage,
    startedAt: record.startedAt,
    completedAt: record.completedAt,
    createdAt: record.createdAt,
  };
}

function buildCompletionPayload(record: {
  id: string;
  status: BackupRecordSummary["status"];
  backupType: BackupType;
  storagePath: string | null;
  fileSize: number | null;
  checksum: string | null;
  completedAt: Date | null;
  metadata: Record<string, unknown> | null;
}): BackupCompletionPayload {
  return {
    id: record.id,
    status: record.status,
    backupType: record.backupType,
    storagePath: record.storagePath,
    fileSize: record.fileSize,
    checksum: record.checksum,
    completedAt: record.completedAt?.toISOString() ?? null,
    metadata: record.metadata,
  };
}

function buildStoragePath(backupId: string, encrypted: boolean): string {
  return `${backupId}${encrypted ? ".enc" : ".json.gz"}`;
}

async function loadBackupSettings() {
  const settings = await findSettings();

  if (!settings) {
    throw new Error("Settings record not found");
  }

  return settings;
}

async function applyRetentionPolicy(): Promise<number> {
  const settings = await loadBackupSettings();
  const expiredIds = await findExpiredBackupIds(settings.backupRetentionMaxCount);

  for (const id of expiredIds) {
    const record = await findBackupRecordById(id);

    if (record?.storagePath) {
      try {
        await removeObject(BACKUP_STORAGE_BUCKET, record.storagePath);
      } catch {
        // Retention cleanup should not block backup completion.
      }
    }
  }

  return deleteBackupRecords(expiredIds);
}

export async function createBackup(input: {
  backupType: BackupType;
  triggeredBy: BackupTrigger;
  context: HistoryMutationContext;
  metadata?: Record<string, unknown>;
}): Promise<BackupRecordSummary> {
  const user = await getAuthenticatedUser();
  const settings = await loadBackupSettings();
  const encrypt = settings.backupEncryptionEnabled;

  const created = await insertBackupRecord({
    createdBy: input.context.profileId ?? user?.id ?? null,
    backupType: input.backupType,
    triggeredBy: input.triggeredBy,
    metadata: {
      initiatedBy: input.context.profileId ?? user?.id ?? null,
      initiatedAt: new Date().toISOString(),
      ...input.metadata,
    },
  });

  try {
    const snapshot = await collectBackupSnapshot(input.backupType);
    const archive = serializeBackupSnapshot(snapshot, input.backupType, encrypt);

    if (archive.fileSize > BACKUP_MAX_ARCHIVE_BYTES) {
      throw new Error("Backup archive exceeds maximum allowed size");
    }

    const storagePath = buildStoragePath(created.id, encrypt);

    await uploadObject({
      bucket: BACKUP_STORAGE_BUCKET,
      path: storagePath,
      buffer: archive.buffer,
      contentType: encrypt ? "application/octet-stream" : "application/gzip",
      upsert: true,
    });

    const completed = await completeBackupRecord({
      id: created.id,
      storagePath,
      fileSize: archive.fileSize,
      checksum: archive.checksum,
      encrypted: encrypt,
      manifestVersion: archive.manifestVersion,
      validationStatus: "valid",
      metadata: {
        backupType: input.backupType,
        triggeredBy: input.triggeredBy,
        parts: snapshot.counts ?? null,
        encrypted: encrypt,
      },
    });

    if (!completed) {
      throw new Error("Failed to finalize backup record");
    }

    await applyRetentionPolicy();

    emitWebhookEvent("backup.completed", {
      ...buildCompletionPayload(completed),
    });

    if (input.triggeredBy !== "pre_restore") {
      const profileId = input.context.profileId ?? user?.id ?? null;

      await createNotification({
        profileId,
        type: "success",
        title: "Backup completed",
        message: `${input.backupType === "full" ? "Full" : "Metadata"} backup finished successfully.`,
        metadata: { entityType: "system", entityId: completed.id },
      });
    }

    return mapBackupSummary(completed);
  } catch (error) {
    await failBackupRecord(created.id, error instanceof Error ? error.message : "Backup failed");

    if (input.triggeredBy !== "pre_restore") {
      const profileId = input.context.profileId ?? user?.id ?? null;

      await createNotification({
        profileId,
        type: "error",
        title: "Backup failed",
        message: error instanceof Error ? error.message : "Backup failed",
        metadata: { entityType: "system", entityId: created.id },
      });
    }

    throw error;
  }
}

export async function runMetadataBackup(
  context: HistoryMutationContext,
): Promise<BackupRecordSummary> {
  return createBackup({
    backupType: "metadata",
    triggeredBy: "manual",
    context,
  });
}

export async function runFullBackup(context: HistoryMutationContext): Promise<BackupRecordSummary> {
  return createBackup({
    backupType: "full",
    triggeredBy: "manual",
    context,
  });
}

export async function listBackupRecords(limit = 20): Promise<BackupRecordSummary[]> {
  await getAuthenticatedUser();
  return findBackupRecords(limit);
}

export async function getBackupOverview(): Promise<BackupOverview> {
  await getAuthenticatedUser();
  const [stats, settings] = await Promise.all([findBackupOverviewStats(), loadBackupSettings()]);

  return {
    latestBackup: stats.latestBackup ? mapBackupSummary(stats.latestBackup) : null,
    totalBackups: stats.totalBackups,
    completedCount: stats.completedCount,
    failedCount: stats.failedCount,
    totalStorageBytes: stats.totalStorageBytes,
    scheduleEnabled: settings.backupScheduleEnabled,
    scheduleHourUtc: settings.backupScheduleHourUtc,
    retentionMaxCount: settings.backupRetentionMaxCount,
    encryptionEnabled: settings.backupEncryptionEnabled,
  };
}

export async function loadBackupArchive(backupId: string) {
  const record = await findBackupRecordById(backupId);

  if (!record || record.status !== "completed" || !record.storagePath) {
    throw new Error("Backup archive not found");
  }

  const buffer = await downloadObject(BACKUP_STORAGE_BUCKET, record.storagePath);

  if (record.checksum && !validateBackupArchiveChecksum(buffer, record.checksum)) {
    throw new Error("Backup archive checksum validation failed");
  }

  return {
    record,
    payload: parseBackupArchive(buffer, record.encrypted),
  };
}

export async function validateBackup(backupId: string): Promise<BackupValidationResult> {
  await getAuthenticatedUser();

  const warnings: string[] = [];

  try {
    const { record, payload } = await loadBackupArchive(backupId);

    if (payload.manifest.version !== record.manifestVersion) {
      warnings.push("Manifest version differs from stored record");
    }

    const status = warnings.length > 0 ? "warning" : "valid";
    await updateBackupValidationStatus(backupId, status);

    return {
      backupId,
      status,
      checksumValid: true,
      manifestValid: true,
      warnings,
    };
  } catch (error) {
    await updateBackupValidationStatus(backupId, "invalid");

    return {
      backupId,
      status: "invalid",
      checksumValid: false,
      manifestValid: false,
      warnings: [error instanceof Error ? error.message : "Validation failed"],
    };
  }
}

export async function deleteBackup(backupId: string): Promise<void> {
  await getAuthenticatedUser();

  const record = await findBackupRecordById(backupId);

  if (!record) {
    throw new Error("Backup not found");
  }

  if (record.isProtected) {
    throw new Error("Protected backups cannot be deleted");
  }

  if (record.storagePath) {
    await removeObject(BACKUP_STORAGE_BUCKET, record.storagePath);
  }

  const deleted = await deleteBackupRecord(backupId);

  if (!deleted) {
    throw new Error("Failed to delete backup record");
  }
}

export async function protectBackup(backupId: string, isProtected: boolean): Promise<void> {
  await getAuthenticatedUser();
  await setBackupProtection(backupId, isProtected);
}

export async function runScheduledBackupIfDue(): Promise<{
  readonly ran: boolean;
  readonly id?: string;
}> {
  const settings = await loadBackupSettings();

  if (!settings.backupScheduleEnabled) {
    return { ran: false };
  }

  const currentHour = new Date().getUTCHours();

  if (currentHour !== settings.backupScheduleHourUtc) {
    return { ran: false };
  }

  const existingToday = await findLatestScheduledBackupToday();

  if (existingToday) {
    return { ran: false };
  }

  const result = await createBackup({
    backupType: "full",
    triggeredBy: "scheduled",
    context: {
      profileId: null,
      metadata: {
        ipAddress: null,
        userAgent: "backup-cron",
        browser: null,
        operatingSystem: null,
        deviceName: null,
      },
    },
  });

  return { ran: true, id: result.id };
}
