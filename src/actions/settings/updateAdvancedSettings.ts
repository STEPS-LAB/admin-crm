"use server";

import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import { advancedSettingsSchema } from "@/schemas/settings/settingsSchemas";
import { updateAdvancedSettings } from "@/services/settingsService";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export async function updateAdvancedSettingsAction(
  _previousState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = advancedSettingsSchema.safeParse({
    developerModeEnabled: formData.get("developerModeEnabled") === "true",
    showSqlQueries: formData.get("showSqlQueries") === "true",
    showApiTiming: formData.get("showApiTiming") === "true",
    showServerActions: formData.get("showServerActions") === "true",
    mockDataEnabled: formData.get("mockDataEnabled") === "true",
    testModeEnabled: formData.get("testModeEnabled") === "true",
    developerToolbarEnabled: formData.get("developerToolbarEnabled") === "true",
    verboseLoggingEnabled: formData.get("verboseLoggingEnabled") === "true",
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateAdvancedSettings(parsed.data, context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update advanced settings",
      code: "UPDATE_FAILED",
    };
  }
}
