"use server";

import { markNotificationRead } from "@/services/notificationService";
import { notificationIdSchema } from "@/schemas/notifications/notificationSchemas";

import type { ServerActionResult } from "@/types";

export async function markNotificationReadAction(
  notificationId: string,
): Promise<ServerActionResult<{ id: string }>> {
  const parsed = notificationIdSchema.safeParse({ id: notificationId });

  if (!parsed.success) {
    return { success: false, error: "Invalid notification id", code: "VALIDATION_ERROR" };
  }

  try {
    await markNotificationRead(parsed.data.id);
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark notification as read",
      code: "UPDATE_FAILED",
    };
  }
}
