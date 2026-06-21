"use server";

import { revalidatePath } from "next/cache";

import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import { updateCacheSettings } from "@/services/settingsService";
import { cacheSettingsSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export async function updateCacheSettingsAction(
  _prevState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = cacheSettingsSchema.safeParse({
    cacheEnabled: formData.get("cacheEnabled"),
    cacheDurationSeconds: formData.get("cacheDurationSeconds"),
    cacheAutoCleanup: formData.get("cacheAutoCleanup"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateCacheSettings(parsed.data, context);
    revalidatePath("/admin/settings/cache");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update cache settings",
      code: "UPDATE_FAILED",
    };
  }
}
