"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { runMetadataBackup } from "@/services/backupService";

import type { ServerActionResult } from "@/types";
import type { BackupRecordSummary } from "@/types/backup";

export async function runMetadataBackupAction(): Promise<
  ServerActionResult<BackupRecordSummary>
> {
  try {
    const context = await buildMutationContext();
    const result = await runMetadataBackup(context);
    revalidatePath("/admin/settings/system");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create metadata backup",
      code: "BACKUP_FAILED",
    };
  }
}
