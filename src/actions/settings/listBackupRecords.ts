"use server";

import { listBackupRecords } from "@/services/backupService";

import type { BackupRecordSummary } from "@/types/backup";

export async function listBackupRecordsAction(
  limit = 20,
): Promise<BackupRecordSummary[]> {
  return listBackupRecords(limit);
}
