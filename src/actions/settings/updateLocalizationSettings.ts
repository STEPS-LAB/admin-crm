"use server";

import { revalidatePath } from "next/cache";

import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import { updateLocalizationSettings } from "@/services/settingsService";
import { localizationSettingsSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

function parseSupportedLanguages(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export async function updateLocalizationSettingsAction(
  _prevState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = localizationSettingsSchema.safeParse({
    defaultLanguage: formData.get("defaultLanguage"),
    supportedLanguages: parseSupportedLanguages(formData.get("supportedLanguages")),
    fallbackLanguage: formData.get("fallbackLanguage"),
    timezone: formData.get("timezone"),
    currency: formData.get("currency"),
    automaticLocaleDetection: formData.get("automaticLocaleDetection"),
    browserLanguageDetection: formData.get("browserLanguageDetection"),
    languageSwitcherEnabled: formData.get("languageSwitcherEnabled"),
    localizedUrlsEnabled: formData.get("localizedUrlsEnabled"),
    rtlSupportEnabled: formData.get("rtlSupportEnabled"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateLocalizationSettings(parsed.data, context);
    revalidatePath("/admin/settings/localization");
    revalidatePath("/site");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update localization settings",
      code: "UPDATE_FAILED",
    };
  }
}
