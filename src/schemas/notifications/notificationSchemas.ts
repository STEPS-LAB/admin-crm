import { z } from "zod";

import {
  NOTIFICATION_PAGE_SIZE_OPTIONS,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TYPES,
} from "@/constants/notifications";

export const notificationListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine(
      (value) =>
        NOTIFICATION_PAGE_SIZE_OPTIONS.includes(value as (typeof NOTIFICATION_PAGE_SIZE_OPTIONS)[number]),
      { message: "Invalid page size" },
    )
    .default(25),
  q: z.string().trim().optional(),
  type: z.enum(NOTIFICATION_TYPES).optional(),
  status: z.enum(NOTIFICATION_STATUSES).optional().default("all"),
});

export type NotificationListFiltersInput = z.infer<typeof notificationListFiltersSchema>;

export const notificationIdSchema = z.object({
  id: z.string().uuid(),
});

export const notificationSettingsSchema = z.object({
  emailEnabled: z.coerce.boolean(),
  pushEnabled: z.coerce.boolean(),
  seoAlertsEnabled: z.coerce.boolean(),
  systemAlertsEnabled: z.coerce.boolean(),
});

export type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;
