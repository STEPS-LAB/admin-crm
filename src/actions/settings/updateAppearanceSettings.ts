"use server";

import { revalidatePath } from "next/cache";

import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import { updateAppearanceSettings } from "@/services/settingsService";
import { appearanceSettingsSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export async function updateAppearanceSettingsAction(
  _prevState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = appearanceSettingsSchema.safeParse({
    theme: formData.get("theme"),
    primaryColor: formData.get("primaryColor"),
    borderRadius: formData.get("borderRadius"),
    layoutDensity: formData.get("layoutDensity"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateAppearanceSettings(parsed.data, context);
    revalidatePath("/admin/settings/appearance");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update appearance settings",
      code: "UPDATE_FAILED",
    };
  }
}
