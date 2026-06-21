import type { NotificationStatusFilter, NotificationType } from "@/constants/notifications";

export interface NotificationMetadata {
  readonly entityType?: string;
  readonly entityId?: string;
  readonly category?: string;
  readonly priority?: "critical" | "high" | "medium" | "low" | "info";
}

export interface NotificationListItem {
  readonly id: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly link: string | null;
  readonly metadata: NotificationMetadata | null;
  readonly isRead: boolean;
  readonly readAt: Date | null;
  readonly createdAt: Date;
}

export interface NotificationListFilters {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string | undefined;
  readonly type?: NotificationType | undefined;
  readonly status?: NotificationStatusFilter | undefined;
}

export interface NotificationSummary {
  readonly unreadCount: number;
  readonly criticalCount: number;
}

export interface NotificationSettings {
  readonly id: string;
  readonly emailEnabled: boolean;
  readonly pushEnabled: boolean;
  readonly seoAlertsEnabled: boolean;
  readonly systemAlertsEnabled: boolean;
}

export interface NotificationSettingsInput {
  readonly emailEnabled: boolean;
  readonly pushEnabled: boolean;
  readonly seoAlertsEnabled: boolean;
  readonly systemAlertsEnabled: boolean;
}

export interface CreateNotificationInput {
  readonly profileId: string | null;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly link?: string | null;
  readonly metadata?: NotificationMetadata | null;
}
