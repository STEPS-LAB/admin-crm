import { RESTORE_SCOPE_LABELS, type RestoreScope } from "@/constants/backup";
import { loadBackupArchive, createBackup } from "@/services/backupService";
import { applyRestoreScopes, previewRestoreScopes } from "@/repositories/restoreRepository";
import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";
import { createNotification } from "@/services/notificationService";

import type { RestoreExecutionResult, RestorePreviewResult } from "@/types/backup";
import type { HistoryMutationContext } from "@/services/historyService";

export async function previewRestore(
  backupId: string,
  scopes: readonly RestoreScope[],
): Promise<RestorePreviewResult> {
  await getAuthenticatedUser();

  if (scopes.length === 0) {
    throw new Error("Select at least one restore scope");
  }

  const { record, payload } = await loadBackupArchive(backupId);
  const scopePreviews = await previewRestoreScopes(payload, scopes);

  const canRestore = scopePreviews.every(
    (preview) => preview.warnings.length === 0 || preview.willCreate + preview.willUpdate > 0,
  );

  return {
    backupId,
    backupType: record.backupType,
    manifestVersion: record.manifestVersion ?? payload.manifest.version,
    scopes: scopePreviews.map((preview) => ({
      scope: preview.scope,
      label: RESTORE_SCOPE_LABELS[preview.scope],
      willCreate: preview.willCreate,
      willUpdate: preview.willUpdate,
      willSkip: preview.willSkip,
      warnings: preview.warnings,
    })),
    canRestore,
    estimatedDurationSeconds: Math.max(2, scopes.length * 2),
  };
}

export async function executeRestore(input: {
  backupId: string;
  scopes: readonly RestoreScope[];
  context: HistoryMutationContext;
}): Promise<RestoreExecutionResult> {
  await getAuthenticatedUser();

  const preview = await previewRestore(input.backupId, input.scopes);

  if (!preview.canRestore) {
    throw new Error("Restore preview detected blocking issues");
  }

  const safetyBackup = await createBackup({
    backupType: "full",
    triggeredBy: "pre_restore",
    context: input.context,
    metadata: {
      restoreSourceId: input.backupId,
      restoreScopes: input.scopes,
    },
  });

  try {
    const { payload } = await loadBackupArchive(input.backupId);
    await applyRestoreScopes(payload, input.scopes);

    await createNotification({
      profileId: input.context.profileId,
      type: "success",
      title: "Restore completed",
      message: `Restored ${input.scopes.length} scope(s) from backup.`,
      metadata: { entityType: "system", entityId: input.backupId },
    });

    return {
      backupId: input.backupId,
      safetyBackupId: safetyBackup.id,
      scopes: input.scopes,
      restoredAt: new Date().toISOString(),
    };
  } catch (error) {
    await createNotification({
      profileId: input.context.profileId,
      type: "error",
      title: "Restore failed",
      message: error instanceof Error ? error.message : "Restore failed",
      metadata: { entityType: "system", entityId: input.backupId },
    });

    throw error;
  }
}

export async function rollbackRestore(
  safetyBackupId: string,
  context: HistoryMutationContext,
): Promise<RestoreExecutionResult> {
  return executeRestore({
    backupId: safetyBackupId,
    scopes: ["settings", "redirects", "seo_templates", "feature_flags"],
    context,
  });
}
