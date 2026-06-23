import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";
import {
  countCriticalUnreadNotifications,
  countUnreadNotifications,
  deleteNotification as removeNotification,
  deleteReadNotifications,
  ensureNotificationSettings,
  findNotificationSettings,
  findNotifications,
  insertNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationSettingsRecord,
} from "@/repositories/notificationRepository";

import type { AuthUser } from "@/types/auth";
import type { Pagination } from "@/types";
import type {
  CreateNotificationInput,
  NotificationListFilters,
  NotificationListItem,
  NotificationSettings,
  NotificationSettingsInput,
  NotificationSummary,
} from "@/types/notifications";

async function requireAuthenticatedUser(): Promise<AuthUser> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

export async function listNotifications(
  filters: NotificationListFilters,
): Promise<Pagination<NotificationListItem>> {
  const user = await requireAuthenticatedUser();

  return findNotifications(user.id, filters);
}

export async function getNotificationSummary(): Promise<NotificationSummary> {
  const user = await requireAuthenticatedUser();

  const [unreadCount, criticalCount] = await Promise.all([
    countUnreadNotifications(user.id),
    countCriticalUnreadNotifications(user.id),
  ]);

  return {
    unreadCount,
    criticalCount,
  };
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const user = await requireAuthenticatedUser();
  const updated = await markNotificationAsRead(user.id, notificationId);

  if (!updated) {
    throw new Error("Notification not found");
  }
}

export async function markAllNotificationsRead(): Promise<number> {
  const user = await requireAuthenticatedUser();

  return markAllNotificationsAsRead(user.id);
}

export async function dismissNotification(notificationId: string): Promise<void> {
  const user = await requireAuthenticatedUser();
  const deleted = await removeNotification(user.id, notificationId);

  if (!deleted) {
    throw new Error("Notification not found");
  }
}

export async function clearReadNotifications(): Promise<number> {
  const user = await requireAuthenticatedUser();

  return deleteReadNotifications(user.id);
}

export async function createNotification(input: CreateNotificationInput): Promise<string> {
  return insertNotification(input);
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const user = await requireAuthenticatedUser();

  return ensureNotificationSettings(user.id);
}

export async function updateNotificationSettings(
  input: NotificationSettingsInput,
): Promise<NotificationSettings> {
  const user = await requireAuthenticatedUser();

  return updateNotificationSettingsRecord(user.id, input);
}

export async function loadNotificationSettings(): Promise<NotificationSettings | null> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  return findNotificationSettings(user.id);
}
