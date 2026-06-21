"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import {
  deleteBackup,
  getBackupOverview,
  protectBackup,
  runFullBackup,
  validateBackup,
} from "@/services/backupService";
import { executeRestore, previewRestore } from "@/services/restoreService";
import { updateBackupSettings } from "@/services/settingsService";
import {
  backupIdSchema,
  protectBackupSchema,
  restoreScopesSchema,
} from "@/schemas/backup/backupSchemas";
import { backupSettingsSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type {
  BackupOverview,
  BackupRecordSummary,
  BackupValidationResult,
  RestoreExecutionResult,
  RestorePreviewResult,
} from "@/types/backup";
import type { SettingsMutationResult } from "@/services/settingsService";

export async function getBackupOverviewAction(): Promise<BackupOverview> {
  return getBackupOverview();
}

export async function runFullBackupAction(): Promise<ServerActionResult<BackupRecordSummary>> {
  try {
    const context = await buildMutationContext();
    const result = await runFullBackup(context);
    revalidatePath("/admin/settings/system");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create full backup",
      code: "BACKUP_FAILED",
    };
  }
}

export async function validateBackupAction(
  backupId: string,
): Promise<ServerActionResult<BackupValidationResult>> {
  const parsed = backupIdSchema.safeParse({ backupId });

  if (!parsed.success) {
    return { success: false, error: "Invalid backup id", code: "VALIDATION_ERROR" };
  }

  try {
    const result = await validateBackup(parsed.data.backupId);
    revalidatePath("/admin/settings/system");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to validate backup",
      code: "VALIDATION_FAILED",
    };
  }
}

export async function deleteBackupAction(
  backupId: string,
): Promise<ServerActionResult<{ readonly id: string }>> {
  const parsed = backupIdSchema.safeParse({ backupId });

  if (!parsed.success) {
    return { success: false, error: "Invalid backup id", code: "VALIDATION_ERROR" };
  }

  try {
    await deleteBackup(parsed.data.backupId);
    revalidatePath("/admin/settings/system");
    return { success: true, data: { id: parsed.data.backupId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete backup",
      code: "DELETE_FAILED",
    };
  }
}

export async function protectBackupAction(
  backupId: string,
  isProtected: boolean,
): Promise<ServerActionResult<{ readonly id: string }>> {
  const parsed = protectBackupSchema.safeParse({ backupId, isProtected });

  if (!parsed.success) {
    return { success: false, error: "Invalid input", code: "VALIDATION_ERROR" };
  }

  try {
    await protectBackup(parsed.data.backupId, parsed.data.isProtected);
    revalidatePath("/admin/settings/system");
    return { success: true, data: { id: parsed.data.backupId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update backup protection",
      code: "UPDATE_FAILED",
    };
  }
}

export async function previewRestoreAction(
  backupId: string,
  scopes: string[],
): Promise<ServerActionResult<RestorePreviewResult>> {
  const idParsed = backupIdSchema.safeParse({ backupId });
  const scopesParsed = restoreScopesSchema.safeParse(scopes);

  if (!idParsed.success || !scopesParsed.success) {
    return { success: false, error: "Invalid restore request", code: "VALIDATION_ERROR" };
  }

  try {
    const result = await previewRestore(idParsed.data.backupId, scopesParsed.data);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to preview restore",
      code: "PREVIEW_FAILED",
    };
  }
}

export async function executeRestoreAction(
  backupId: string,
  scopes: string[],
): Promise<ServerActionResult<RestoreExecutionResult>> {
  const idParsed = backupIdSchema.safeParse({ backupId });
  const scopesParsed = restoreScopesSchema.safeParse(scopes);

  if (!idParsed.success || !scopesParsed.success) {
    return { success: false, error: "Invalid restore request", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await executeRestore({
      backupId: idParsed.data.backupId,
      scopes: scopesParsed.data,
      context,
    });
    revalidatePath("/admin/settings/system");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to restore backup",
      code: "RESTORE_FAILED",
    };
  }
}

export async function updateBackupSettingsAction(
  _prevState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = backupSettingsSchema.safeParse({
    backupScheduleEnabled: formData.get("backupScheduleEnabled"),
    backupScheduleHourUtc: formData.get("backupScheduleHourUtc"),
    backupRetentionMaxCount: formData.get("backupRetentionMaxCount"),
    backupEncryptionEnabled: formData.get("backupEncryptionEnabled"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateBackupSettings(parsed.data, context);
    revalidatePath("/admin/settings/system");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update backup settings",
      code: "UPDATE_FAILED",
    };
  }
}
