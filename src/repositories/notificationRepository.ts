import { and, count, desc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import { notificationSettings, notifications } from "@/db/schema/notifications";
import { calculatePagination } from "@/repositories/baseRepository";

import type { NotificationType } from "@/constants/notifications";
import type { Pagination } from "@/types";
import type {
  CreateNotificationInput,
  NotificationListFilters,
  NotificationListItem,
  NotificationMetadata,
  NotificationSettings,
  NotificationSettingsInput,
} from "@/types/notifications";

function profileScope(profileId: string): SQL {
  return or(eq(notifications.profileId, profileId), isNull(notifications.profileId))!;
}

function profileSettingsScope(profileId: string): SQL {
  return eq(notificationSettings.profileId, profileId);
}

function buildNotificationWhere(profileId: string, filters: NotificationListFilters): SQL {
  const conditions: SQL[] = [profileScope(profileId)];

  if (filters.status === "unread") {
    conditions.push(eq(notifications.isRead, false));
  }

  if (filters.status === "read") {
    conditions.push(eq(notifications.isRead, true));
  }

  if (filters.type) {
    conditions.push(eq(notifications.type, filters.type));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(or(ilike(notifications.title, term), ilike(notifications.message, term))!);
  }

  return and(...conditions)!;
}

function mapNotificationRow(row: {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  metadata: unknown;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}): NotificationListItem {
  return {
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message,
    link: row.link,
    metadata: (row.metadata as NotificationMetadata | null) ?? null,
    isRead: row.isRead,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

export async function findNotifications(
  profileId: string,
  filters: NotificationListFilters,
): Promise<Pagination<NotificationListItem>> {
  const db = getDb();
  const whereClause = buildNotificationWhere(profileId, filters);
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        link: notifications.link,
        metadata: notifications.metadata,
        isRead: notifications.isRead,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(filters.pageSize)
      .offset(offset),
    db.select({ value: count() }).from(notifications).where(whereClause),
  ]);

  const items = rows.map(mapNotificationRow);

  return calculatePagination(items, totalRows[0]?.value ?? 0, {
    page: filters.page,
    pageSize: filters.pageSize,
  });
}

export async function countUnreadNotifications(profileId: string): Promise<number> {
  const db = getDb();

  const [row] = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(profileScope(profileId), eq(notifications.isRead, false)));

  return row?.value ?? 0;
}

export async function countCriticalUnreadNotifications(profileId: string): Promise<number> {
  const db = getDb();

  const [row] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(profileScope(profileId), eq(notifications.isRead, false), eq(notifications.type, "error")),
    );

  return row?.value ?? 0;
}

export async function markNotificationAsRead(
  profileId: string,
  notificationId: string,
): Promise<boolean> {
  const db = getDb();

  const rows = await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(and(eq(notifications.id, notificationId), profileScope(profileId)))
    .returning({ id: notifications.id });

  return rows.length > 0;
}

export async function markAllNotificationsAsRead(profileId: string): Promise<number> {
  const db = getDb();

  const rows = await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(and(profileScope(profileId), eq(notifications.isRead, false)))
    .returning({ id: notifications.id });

  return rows.length;
}

export async function deleteNotification(
  profileId: string,
  notificationId: string,
): Promise<boolean> {
  const db = getDb();

  const rows = await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), profileScope(profileId)))
    .returning({ id: notifications.id });

  return rows.length > 0;
}

export async function deleteReadNotifications(profileId: string): Promise<number> {
  const db = getDb();

  const rows = await db
    .delete(notifications)
    .where(and(profileScope(profileId), eq(notifications.isRead, true)))
    .returning({ id: notifications.id });

  return rows.length;
}

export async function insertNotification(input: CreateNotificationInput): Promise<string> {
  const db = getDb();

  const [row] = await db
    .insert(notifications)
    .values({
      profileId: input.profileId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
      metadata: input.metadata ?? null,
    })
    .returning({ id: notifications.id });

  if (!row) {
    throw new Error("Failed to create notification");
  }

  return row.id;
}

export async function findNotificationSettings(
  profileId: string,
): Promise<NotificationSettings | null> {
  const db = getDb();

  const [row] = await db
    .select({
      id: notificationSettings.id,
      emailEnabled: notificationSettings.emailEnabled,
      pushEnabled: notificationSettings.pushEnabled,
      seoAlertsEnabled: notificationSettings.seoAlertsEnabled,
      systemAlertsEnabled: notificationSettings.systemAlertsEnabled,
    })
    .from(notificationSettings)
    .where(profileSettingsScope(profileId))
    .limit(1);

  if (!row) {
    return null;
  }

  return row;
}

export async function ensureNotificationSettings(profileId: string): Promise<NotificationSettings> {
  const existing = await findNotificationSettings(profileId);

  if (existing) {
    return existing;
  }

  const db = getDb();

  const [row] = await db
    .insert(notificationSettings)
    .values({ profileId })
    .returning({
      id: notificationSettings.id,
      emailEnabled: notificationSettings.emailEnabled,
      pushEnabled: notificationSettings.pushEnabled,
      seoAlertsEnabled: notificationSettings.seoAlertsEnabled,
      systemAlertsEnabled: notificationSettings.systemAlertsEnabled,
    });

  if (!row) {
    throw new Error("Failed to create notification settings");
  }

  return row;
}

export async function updateNotificationSettingsRecord(
  profileId: string,
  input: NotificationSettingsInput,
): Promise<NotificationSettings> {
  await ensureNotificationSettings(profileId);

  const db = getDb();

  const [row] = await db
    .update(notificationSettings)
    .set({
      emailEnabled: input.emailEnabled,
      pushEnabled: input.pushEnabled,
      seoAlertsEnabled: input.seoAlertsEnabled,
      systemAlertsEnabled: input.systemAlertsEnabled,
      updatedAt: new Date(),
    })
    .where(profileSettingsScope(profileId))
    .returning({
      id: notificationSettings.id,
      emailEnabled: notificationSettings.emailEnabled,
      pushEnabled: notificationSettings.pushEnabled,
      seoAlertsEnabled: notificationSettings.seoAlertsEnabled,
      systemAlertsEnabled: notificationSettings.systemAlertsEnabled,
    });

  if (!row) {
    throw new Error("Failed to update notification settings");
  }

  return row;
}
