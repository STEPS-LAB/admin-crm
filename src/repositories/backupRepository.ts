import { and, count, desc, eq, inArray, sql } from "drizzle-orm";

import type { BackupTrigger, BackupType, BackupValidationStatus } from "@/constants/backup";
import { getDb } from "@/db/client";
import { backupRecords } from "@/db/schema/backup";

import type { BackupRecordSummary, BackupStatus } from "@/types/backup";

export interface BackupRecordDetail {
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
  readonly createdBy: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

function mapBackupRow(row: typeof backupRecords.$inferSelect): BackupRecordDetail {
  return {
    id: row.id,
    status: row.status,
    backupType: row.backupType,
    triggeredBy: row.triggeredBy,
    encrypted: row.encrypted,
    validationStatus: row.validationStatus,
    isProtected: row.isProtected,
    manifestVersion: row.manifestVersion,
    storagePath: row.storagePath,
    fileSize: row.fileSize,
    checksum: row.checksum,
    metadata: row.metadata as Record<string, unknown> | null,
    errorMessage: row.errorMessage,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapBackupSummary(row: BackupRecordDetail): BackupRecordSummary {
  return {
    id: row.id,
    status: row.status,
    backupType: row.backupType,
    triggeredBy: row.triggeredBy,
    encrypted: row.encrypted,
    validationStatus: row.validationStatus,
    isProtected: row.isProtected,
    manifestVersion: row.manifestVersion,
    storagePath: row.storagePath,
    fileSize: row.fileSize,
    checksum: row.checksum,
    metadata: row.metadata,
    errorMessage: row.errorMessage,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
  };
}

export async function insertBackupRecord(input: {
  createdBy: string | null;
  backupType: BackupType;
  triggeredBy: BackupTrigger;
  metadata?: Record<string, unknown>;
}): Promise<BackupRecordDetail> {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .insert(backupRecords)
    .values({
      status: "in_progress",
      backupType: input.backupType,
      triggeredBy: input.triggeredBy,
      createdBy: input.createdBy,
      startedAt: now,
      metadata: input.metadata ?? null,
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create backup record");
  }

  return mapBackupRow(row);
}

export async function completeBackupRecord(input: {
  id: string;
  storagePath: string | null;
  fileSize: number | null;
  checksum: string | null;
  metadata: Record<string, unknown>;
  encrypted: boolean;
  manifestVersion: string;
  validationStatus?: BackupValidationStatus;
}): Promise<BackupRecordDetail | null> {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .update(backupRecords)
    .set({
      status: "completed",
      storagePath: input.storagePath,
      fileSize: input.fileSize,
      checksum: input.checksum,
      metadata: input.metadata,
      encrypted: input.encrypted,
      manifestVersion: input.manifestVersion,
      validationStatus: input.validationStatus ?? "valid",
      errorMessage: null,
      completedAt: now,
      updatedAt: now,
    })
    .where(eq(backupRecords.id, input.id))
    .returning();

  return row ? mapBackupRow(row) : null;
}

export async function failBackupRecord(
  id: string,
  errorMessage: string,
): Promise<BackupRecordDetail | null> {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .update(backupRecords)
    .set({
      status: "failed",
      validationStatus: "invalid",
      errorMessage,
      completedAt: now,
      updatedAt: now,
    })
    .where(eq(backupRecords.id, id))
    .returning();

  return row ? mapBackupRow(row) : null;
}

export async function updateBackupValidationStatus(
  id: string,
  validationStatus: BackupValidationStatus,
): Promise<void> {
  const db = getDb();

  await db
    .update(backupRecords)
    .set({
      validationStatus,
      updatedAt: new Date(),
    })
    .where(eq(backupRecords.id, id));
}

export async function findBackupRecords(limit = 20): Promise<BackupRecordSummary[]> {
  const db = getDb();

  const rows = await db
    .select()
    .from(backupRecords)
    .orderBy(desc(backupRecords.createdAt))
    .limit(limit);

  return rows.map((row) => mapBackupSummary(mapBackupRow(row)));
}

export async function findBackupRecordById(id: string): Promise<BackupRecordDetail | null> {
  const db = getDb();

  const [row] = await db.select().from(backupRecords).where(eq(backupRecords.id, id)).limit(1);

  return row ? mapBackupRow(row) : null;
}

export async function findBackupOverviewStats(): Promise<{
  totalBackups: number;
  completedCount: number;
  failedCount: number;
  totalStorageBytes: number;
  latestBackup: BackupRecordDetail | null;
}> {
  const db = getDb();

  const [stats] = await db
    .select({
      totalBackups: count(),
      completedCount: sql<number>`count(*) filter (where ${backupRecords.status} = 'completed')`,
      failedCount: sql<number>`count(*) filter (where ${backupRecords.status} = 'failed')`,
      totalStorageBytes: sql<number>`coalesce(sum(${backupRecords.fileSize}), 0)`,
    })
    .from(backupRecords);

  const [latest] = await db
    .select()
    .from(backupRecords)
    .orderBy(desc(backupRecords.createdAt))
    .limit(1);

  return {
    totalBackups: Number(stats?.totalBackups ?? 0),
    completedCount: Number(stats?.completedCount ?? 0),
    failedCount: Number(stats?.failedCount ?? 0),
    totalStorageBytes: Number(stats?.totalStorageBytes ?? 0),
    latestBackup: latest ? mapBackupRow(latest) : null,
  };
}

export async function deleteBackupRecord(id: string): Promise<boolean> {
  const db = getDb();

  const [row] = await db
    .delete(backupRecords)
    .where(and(eq(backupRecords.id, id), eq(backupRecords.isProtected, false)))
    .returning({ id: backupRecords.id });

  return Boolean(row);
}

export async function setBackupProtection(id: string, isProtected: boolean): Promise<void> {
  const db = getDb();

  await db
    .update(backupRecords)
    .set({
      isProtected,
      updatedAt: new Date(),
    })
    .where(eq(backupRecords.id, id));
}

export async function findExpiredBackupIds(retentionMaxCount: number): Promise<string[]> {
  const db = getDb();

  const rows = await db
    .select({ id: backupRecords.id })
    .from(backupRecords)
    .where(
      and(eq(backupRecords.status, "completed"), eq(backupRecords.isProtected, false)),
    )
    .orderBy(desc(backupRecords.createdAt))
    .offset(retentionMaxCount);

  return rows.map((row) => row.id);
}

export async function deleteBackupRecords(ids: readonly string[]): Promise<number> {
  if (ids.length === 0) {
    return 0;
  }

  const db = getDb();

  const deleted = await db
    .delete(backupRecords)
    .where(
      and(
        inArray(backupRecords.id, [...ids]),
        eq(backupRecords.isProtected, false),
      ),
    )
    .returning({ id: backupRecords.id });

  return deleted.length;
}

export async function findLatestScheduledBackupToday(): Promise<BackupRecordDetail | null> {
  const db = getDb();
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [row] = await db
    .select()
    .from(backupRecords)
    .where(
      and(
        eq(backupRecords.triggeredBy, "scheduled"),
        sql`${backupRecords.createdAt} >= ${startOfDay}`,
      ),
    )
    .orderBy(desc(backupRecords.createdAt))
    .limit(1);

  return row ? mapBackupRow(row) : null;
}
