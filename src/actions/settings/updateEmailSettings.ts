"use server";

import { revalidatePath } from "next/cache";

import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import { updateEmailSettings } from "@/services/settingsService";
import { emailSettingsFormSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export async function updateEmailSettingsAction(
  _prevState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = emailSettingsFormSchema.safeParse({
    smtpHost: formData.get("smtpHost"),
    smtpPort: formData.get("smtpPort"),
    smtpUsername: formData.get("smtpUsername"),
    smtpPassword: formData.get("smtpPassword") || undefined,
    smtpEncryption: formData.get("smtpEncryption"),
    emailSenderName: formData.get("emailSenderName"),
    emailSenderAddress: formData.get("emailSenderAddress"),
    emailReplyTo: formData.get("emailReplyTo"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateEmailSettings(parsed.data, context);
    revalidatePath("/admin/settings/email");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update email settings",
      code: "UPDATE_FAILED",
    };
  }
}
