export const NOTIFICATION_TYPES = [
  "info",
  "success",
  "warning",
  "error",
  "seo",
  "system",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  info: "Information",
  success: "Success",
  warning: "Warning",
  error: "Error",
  seo: "SEO",
  system: "System",
};

export const NOTIFICATION_STATUSES = ["all", "unread", "read"] as const;

export type NotificationStatusFilter = (typeof NOTIFICATION_STATUSES)[number];

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatusFilter, string> = {
  all: "All",
  unread: "Unread",
  read: "Read",
};

export const NOTIFICATION_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export const CRITICAL_NOTIFICATION_TYPES: readonly NotificationType[] = ["error"];
