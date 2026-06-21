"use server";

import { enforceListSearchRateLimit } from "@/actions/guards/listActionGuards";
import { listBrands } from "@/services/brandService";
import { brandListFiltersSchema } from "@/schemas/brands/brandSchemas";

import type { Pagination } from "@/types";
import type { BrandListItem } from "@/types/brands";

function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): ReturnType<typeof brandListFiltersSchema.parse> {
  return brandListFiltersSchema.parse({
    page: params.page,
    pageSize: params.pageSize,
    q: typeof params.q === "string" ? params.q : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    hasProducts: typeof params.hasProducts === "string" ? params.hasProducts : undefined,
  });
}

export async function listBrandsAction(
  params: Record<string, string | string[] | undefined>,
): Promise<Pagination<BrandListItem>> {
  const filters = parseSearchParams(params);

  await enforceListSearchRateLimit(filters.q);

  return listBrands({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.q,
    status: filters.status,
    hasProducts: filters.hasProducts,
  });
}
