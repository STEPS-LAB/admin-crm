"use server";

import { enforceListSearchRateLimit } from "@/actions/guards/listActionGuards";
import { listNotifications } from "@/services/notificationService";
import { notificationListFiltersSchema } from "@/schemas/notifications/notificationSchemas";

import type { Pagination } from "@/types";
import type { NotificationListItem } from "@/types/notifications";

export async function listNotificationsAction(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<Pagination<NotificationListItem>> {
  const parsed = notificationListFiltersSchema.safeParse({
    page: rawParams.page,
    pageSize: rawParams.pageSize,
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
    type: typeof rawParams.type === "string" ? rawParams.type : undefined,
    status: typeof rawParams.status === "string" ? rawParams.status : undefined,
  });

  const filters = parsed.success ? parsed.data : notificationListFiltersSchema.parse({});

  await enforceListSearchRateLimit(filters.q);

  return listNotifications({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.q,
    type: filters.type,
    status: filters.status,
  });
}
