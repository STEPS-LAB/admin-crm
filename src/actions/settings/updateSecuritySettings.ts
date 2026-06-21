"use server";

import { revalidatePath } from "next/cache";

import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import { updateSecuritySettings } from "@/services/settingsService";
import { securitySettingsSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export async function updateSecuritySettingsAction(
  _prevState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = securitySettingsSchema.safeParse({
    securityLevel: formData.get("securityLevel"),
    sessionIdleTimeoutHours: formData.get("sessionIdleTimeoutHours"),
    sessionAbsoluteLifetimeHours: formData.get("sessionAbsoluteLifetimeHours"),
    loginLockoutEnabled: formData.get("loginLockoutEnabled"),
    loginMaxAttempts: formData.get("loginMaxAttempts"),
    loginLockoutWindowMinutes: formData.get("loginLockoutWindowMinutes"),
    rateLimitSettingsPerMinute: formData.get("rateLimitSettingsPerMinute"),
    rateLimitUploadPerMinute: formData.get("rateLimitUploadPerMinute"),
    rateLimitApiPerMinute: formData.get("rateLimitApiPerMinute"),
    rateLimitSearchPerMinute: formData.get("rateLimitSearchPerMinute"),
    rateLimitImportPerMinute: formData.get("rateLimitImportPerMinute"),
    rateLimitExportPerMinute: formData.get("rateLimitExportPerMinute"),
    auditLogLoginEnabled: formData.get("auditLogLoginEnabled"),
    auditLogFailedLoginEnabled: formData.get("auditLogFailedLoginEnabled"),
    auditLogSettingsChangeEnabled: formData.get("auditLogSettingsChangeEnabled"),
    auditLogMediaUploadEnabled: formData.get("auditLogMediaUploadEnabled"),
    auditLogSeoChangeEnabled: formData.get("auditLogSeoChangeEnabled"),
    ipAllowList: formData.get("ipAllowList"),
    ipBlockList: formData.get("ipBlockList"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateSecuritySettings(parsed.data, context);
    revalidatePath("/admin/settings/security");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update security settings",
      code: "UPDATE_FAILED",
    };
  }
}
