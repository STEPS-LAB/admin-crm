"use server";

import { enforceListSearchRateLimit } from "@/actions/guards/listActionGuards";
import { listRedirects } from "@/services/redirectService";
import { redirectListFiltersSchema } from "@/schemas/seo/seoSchemas";

import type { Pagination } from "@/types";
import type { RedirectListItem } from "@/types/seo-center";

export async function listRedirectsAction(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<Pagination<RedirectListItem>> {
  const parsed = redirectListFiltersSchema.safeParse({
    page: rawParams.page,
    pageSize: rawParams.pageSize,
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
    enabled: typeof rawParams.enabled === "string" ? rawParams.enabled : undefined,
  });

  const filters = parsed.success ? parsed.data : redirectListFiltersSchema.parse({});

  await enforceListSearchRateLimit(filters.q);

  return listRedirects({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.q,
    enabled: filters.enabled,
  });
}
