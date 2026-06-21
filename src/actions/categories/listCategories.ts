"use server";

import { enforceListSearchRateLimit } from "@/actions/guards/listActionGuards";
import { listCategoryTree } from "@/services/categoryService";
import { categoryListFiltersSchema } from "@/schemas/categories/categorySchemas";

import type { CategoryTreeNode } from "@/types/categories";

export async function listCategoriesAction(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<CategoryTreeNode[]> {
  const parsed = categoryListFiltersSchema.safeParse({
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
    status: typeof rawParams.status === "string" ? rawParams.status : undefined,
  });

  const filters = parsed.success ? parsed.data : {};

  await enforceListSearchRateLimit(filters.q);

  return listCategoryTree({
    search: filters.q,
    status: filters.status,
  });
}
