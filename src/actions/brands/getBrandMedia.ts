"use server";

import { getBrandMedia } from "@/services/brandMediaService";
import { brandIdParamSchema } from "@/schemas/media/entityMediaSchemas";

import type { EntityMediaCollection } from "@/types/entity-media";

export async function getBrandMediaAction(brandId: string): Promise<EntityMediaCollection | null> {
  const parsed = brandIdParamSchema.safeParse({ brandId });

  if (!parsed.success) {
    return null;
  }

  return getBrandMedia(parsed.data.brandId);
}
