"use server";

import { getCategoryParentOptions } from "@/services/categoryService";

import type { CategoryParentOption } from "@/types/categories";

export async function getCategoryParentOptionsAction(
  excludeCategoryId?: string,
): Promise<CategoryParentOption[]> {
  return getCategoryParentOptions(excludeCategoryId);
}
