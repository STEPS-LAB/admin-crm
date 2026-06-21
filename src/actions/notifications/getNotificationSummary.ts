"use server";

import { getNotificationSummary } from "@/services/notificationService";

import type { NotificationSummary } from "@/types/notifications";

export async function getNotificationSummaryAction(): Promise<NotificationSummary> {
  return getNotificationSummary();
}
