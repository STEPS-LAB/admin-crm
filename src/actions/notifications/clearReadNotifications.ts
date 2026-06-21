"use server";

import { clearReadNotifications } from "@/services/notificationService";

import type { ServerActionResult } from "@/types";

export async function clearReadNotificationsAction(): Promise<ServerActionResult<{ count: number }>> {
  try {
    const count = await clearReadNotifications();
    return { success: true, data: { count } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear read notifications",
      code: "DELETE_FAILED",
    };
  }
}
