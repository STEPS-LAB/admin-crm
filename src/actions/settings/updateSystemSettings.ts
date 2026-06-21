"use server";

import { revalidatePath } from "next/cache";

import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import { updateSystemSettings } from "@/services/settingsService";
import { systemSettingsSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export async function updateSystemSettingsAction(
  _prevState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = systemSettingsSchema.safeParse({
    maintenanceMode: formData.get("maintenanceMode") === "true",
    debugMode: formData.get("debugMode") === "true",
    cacheEnabled: formData.get("cacheEnabled") === "true",
    seoAutomationEnabled: formData.get("seoAutomationEnabled") === "true",
    autoGenerateSchemas: formData.get("autoGenerateSchemas") === "true",
    autoGenerateMetadata: formData.get("autoGenerateMetadata") === "true",
    allowCustomScripts: formData.get("allowCustomScripts") === "true",
    headScripts: formData.get("headScripts"),
    bodyScripts: formData.get("bodyScripts"),
    footerScripts: formData.get("footerScripts"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateSystemSettings(parsed.data, context);
    revalidatePath("/admin/settings/system");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update system settings",
      code: "UPDATE_FAILED",
    };
  }
}
