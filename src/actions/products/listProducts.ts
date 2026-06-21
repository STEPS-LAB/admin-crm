"use server";

import { enforceListSearchRateLimit } from "@/actions/guards/listActionGuards";
import { listProducts } from "@/services/productService";
import { productListFiltersSchema } from "@/schemas/products/productSchemas";

import type { Pagination } from "@/types";
import type { ProductListItem } from "@/types/products";

export async function listProductsAction(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<Pagination<ProductListItem>> {
  const parsed = productListFiltersSchema.safeParse({
    page: rawParams.page,
    pageSize: rawParams.pageSize,
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
    status: typeof rawParams.status === "string" ? rawParams.status : undefined,
    categoryId: typeof rawParams.categoryId === "string" ? rawParams.categoryId : undefined,
    brandId: typeof rawParams.brandId === "string" ? rawParams.brandId : undefined,
    stockStatus: typeof rawParams.stockStatus === "string" ? rawParams.stockStatus : undefined,
    filter: typeof rawParams.filter === "string" ? rawParams.filter : undefined,
    sortBy: typeof rawParams.sortBy === "string" ? rawParams.sortBy : undefined,
    sortDir: typeof rawParams.sortDir === "string" ? rawParams.sortDir : undefined,
  });

  const filters = parsed.success
    ? parsed.data
    : productListFiltersSchema.parse({});

  await enforceListSearchRateLimit(filters.q);

  return listProducts({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.q,
    status: filters.status,
    categoryId: filters.categoryId,
    brandId: filters.brandId,
    stockStatus: filters.stockStatus,
    qualityFilter: filters.filter,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  });
}
