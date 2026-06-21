"use server";

import { getCategory } from "@/services/categoryService";
import { categoryIdSchema } from "@/schemas/categories/categorySchemas";

import type { CategoryDetail } from "@/types/categories";

export async function getCategoryAction(id: string): Promise<CategoryDetail | null> {
  const parsed = categoryIdSchema.safeParse({ id });

  if (!parsed.success) {
    return null;
  }

  return getCategory(parsed.data.id);
}
