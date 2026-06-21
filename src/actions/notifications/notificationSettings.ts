"use server";

import { getNotificationSettings, updateNotificationSettings } from "@/services/notificationService";
import { notificationSettingsSchema } from "@/schemas/notifications/notificationSchemas";

import type { ServerActionResult } from "@/types";
import type { NotificationSettings } from "@/types/notifications";

export async function getNotificationSettingsAction(): Promise<NotificationSettings | null> {
  try {
    return await getNotificationSettings();
  } catch {
    return null;
  }
}

function parseSettingsForm(formData: FormData) {
  return notificationSettingsSchema.safeParse({
    emailEnabled: formData.get("emailEnabled") === "true",
    pushEnabled: formData.get("pushEnabled") === "true",
    seoAlertsEnabled: formData.get("seoAlertsEnabled") === "true",
    systemAlertsEnabled: formData.get("systemAlertsEnabled") === "true",
  });
}

export async function updateNotificationSettingsAction(
  _prevState: ServerActionResult<NotificationSettings> | null,
  formData: FormData,
): Promise<ServerActionResult<NotificationSettings>> {
  const parsed = parseSettingsForm(formData);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid settings";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const settings = await updateNotificationSettings(parsed.data);
    return { success: true, data: settings };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update notification settings",
      code: "UPDATE_FAILED",
    };
  }
}
