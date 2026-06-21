"use server";

import { getCategoryMedia } from "@/services/categoryMediaService";
import { categoryIdParamSchema } from "@/schemas/media/entityMediaSchemas";

import type { EntityMediaCollection } from "@/types/entity-media";

export async function getCategoryMediaAction(categoryId: string): Promise<EntityMediaCollection | null> {
  const parsed = categoryIdParamSchema.safeParse({ categoryId });

  if (!parsed.success) {
    return null;
  }

  return getCategoryMedia(parsed.data.categoryId);
}
