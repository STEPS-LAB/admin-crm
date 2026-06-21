"use server";

import { revalidatePath } from "next/cache";

import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import { updateStorageSettings } from "@/services/settingsService";
import { storageSettingsSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export async function updateStorageSettingsAction(
  _prevState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = storageSettingsSchema.safeParse({
    storageProvider: formData.get("storageProvider"),
    maxUploadSizeMb: formData.get("maxUploadSizeMb"),
    imageCompressionEnabled: formData.get("imageCompressionEnabled"),
    imageCompressionQuality: formData.get("imageCompressionQuality"),
    autoWebpConversion: formData.get("autoWebpConversion"),
    duplicateDetectionEnabled: formData.get("duplicateDetectionEnabled"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateStorageSettings(parsed.data, context);
    revalidatePath("/admin/settings/storage");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update storage settings",
      code: "UPDATE_FAILED",
    };
  }
}
