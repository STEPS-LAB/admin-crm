"use server";

import { revalidatePath } from "next/cache";

import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import { updateGeneralSettings } from "@/services/settingsService";
import { generalSettingsSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export async function updateGeneralSettingsAction(
  _prevState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = generalSettingsSchema.safeParse({
    siteName: formData.get("siteName"),
    siteDescription: formData.get("siteDescription"),
    siteUrl: formData.get("siteUrl"),
    logoUrl: formData.get("logoUrl"),
    faviconUrl: formData.get("faviconUrl"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateGeneralSettings(parsed.data, context);
    revalidatePath("/admin/settings");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update general settings",
      code: "UPDATE_FAILED",
    };
  }
}
