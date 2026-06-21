import type { NotificationType } from "@/constants/notifications";
import type { NotificationMetadata } from "@/types/notifications";

export interface NotificationVisualStyle {
  readonly badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success";
  readonly accentClass: string;
}

export function getNotificationVisualStyle(type: NotificationType): NotificationVisualStyle {
  switch (type) {
    case "error":
      return {
        badgeVariant: "destructive",
        accentClass: "border-l-destructive",
      };
    case "warning":
      return {
        badgeVariant: "outline",
        accentClass: "border-l-warning",
      };
    case "success":
      return {
        badgeVariant: "success",
        accentClass: "border-l-success",
      };
    case "seo":
      return {
        badgeVariant: "default",
        accentClass: "border-l-primary",
      };
    case "system":
      return {
        badgeVariant: "secondary",
        accentClass: "border-l-muted-foreground",
      };
    case "info":
    default:
      return {
        badgeVariant: "secondary",
        accentClass: "border-l-border",
      };
  }
}

export function getNotificationPriorityLabel(
  type: NotificationType,
  metadata: NotificationMetadata | null,
): string {
  if (metadata?.priority) {
    return metadata.priority.charAt(0).toUpperCase() + metadata.priority.slice(1);
  }

  switch (type) {
    case "error":
      return "Critical";
    case "warning":
      return "High";
    case "seo":
    case "system":
      return "Medium";
    case "success":
      return "Information";
    case "info":
    default:
      return "Low";
  }
}
