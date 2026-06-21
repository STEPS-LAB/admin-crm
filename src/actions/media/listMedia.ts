"use server";

import { enforceListSearchRateLimit } from "@/actions/guards/listActionGuards";
import { listMedia } from "@/services/mediaService";
import { mediaListFiltersSchema } from "@/schemas/media/mediaSchemas";

import type { Pagination } from "@/types";
import type { MediaListItem } from "@/types/media";

export async function listMediaAction(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<Pagination<MediaListItem>> {
  const parsed = mediaListFiltersSchema.safeParse({
    page: rawParams.page,
    pageSize: rawParams.pageSize,
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
    mimeType: typeof rawParams.mimeType === "string" ? rawParams.mimeType : undefined,
    filter: typeof rawParams.filter === "string" ? rawParams.filter : undefined,
  });

  const filters = parsed.success ? parsed.data : mediaListFiltersSchema.parse({});

  await enforceListSearchRateLimit(filters.q);

  return listMedia({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.q,
    mimeType: filters.mimeType,
    filter: filters.filter,
  });
}
