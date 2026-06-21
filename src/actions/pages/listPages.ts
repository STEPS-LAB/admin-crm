"use server";

import { enforceListSearchRateLimit } from "@/actions/guards/listActionGuards";
import { listPages } from "@/services/pageService";
import { pageListFiltersSchema } from "@/schemas/pages/pageSchemas";

import type { Pagination } from "@/types";
import type { PageListItem } from "@/types/pages";

function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): ReturnType<typeof pageListFiltersSchema.parse> {
  return pageListFiltersSchema.parse({
    page: params.page,
    pageSize: params.pageSize,
    q: typeof params.q === "string" ? params.q : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    pageType: typeof params.pageType === "string" ? params.pageType : undefined,
  });
}

export async function listPagesAction(
  params: Record<string, string | string[] | undefined>,
): Promise<Pagination<PageListItem>> {
  const filters = parseSearchParams(params);

  await enforceListSearchRateLimit(filters.q);

  return listPages({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.q,
    status: filters.status,
    pageType: filters.pageType,
  });
}
