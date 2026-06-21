"use server";

import { enforceListSearchRateLimit } from "@/actions/guards/listActionGuards";
import { listSeoProfiles } from "@/services/seoProfileService";
import { seoProfileListFiltersSchema } from "@/schemas/seo/seoSchemas";

import type { Pagination } from "@/types";
import type { SeoProfileListItem } from "@/types/seo-center";

export async function listSeoProfilesAction(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<Pagination<SeoProfileListItem>> {
  const parsed = seoProfileListFiltersSchema.safeParse({
    page: rawParams.page,
    pageSize: rawParams.pageSize,
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
    ownerType: typeof rawParams.ownerType === "string" ? rawParams.ownerType : undefined,
    language: typeof rawParams.language === "string" ? rawParams.language : undefined,
  });

  const filters = parsed.success ? parsed.data : seoProfileListFiltersSchema.parse({});

  await enforceListSearchRateLimit(filters.q);

  return listSeoProfiles({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.q,
    ownerType: filters.ownerType,
    language: filters.language,
  });
}
