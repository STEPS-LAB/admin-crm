"use server";

import { markAllNotificationsRead } from "@/services/notificationService";

import type { ServerActionResult } from "@/types";

export async function markAllNotificationsReadAction(): Promise<ServerActionResult<{ count: number }>> {
  try {
    const count = await markAllNotificationsRead();
    return { success: true, data: { count } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark notifications as read",
      code: "UPDATE_FAILED",
    };
  }
}
