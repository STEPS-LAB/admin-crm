"use server";

import { revalidatePath } from "next/cache";

import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import { updateIntegrationsSettings } from "@/services/settingsService";
import { integrationsSettingsSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export async function updateIntegrationsSettingsAction(
  _prevState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = integrationsSettingsSchema.safeParse({
    googleAnalyticsId: formData.get("googleAnalyticsId"),
    googleTagManagerId: formData.get("googleTagManagerId"),
    googleSearchConsoleVerification: formData.get("googleSearchConsoleVerification"),
    bingWebmasterVerification: formData.get("bingWebmasterVerification"),
    facebookPixelId: formData.get("facebookPixelId"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateIntegrationsSettings(parsed.data, context);
    revalidatePath("/admin/settings/integrations");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update integrations",
      code: "UPDATE_FAILED",
    };
  }
}
