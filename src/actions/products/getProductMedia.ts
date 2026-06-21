"use server";

import { getProductMedia } from "@/services/productMediaService";
import { productIdParamSchema } from "@/schemas/products/productMediaSchemas";

import type { EntityMediaCollection } from "@/types/entity-media";

export async function getProductMediaAction(productId: string): Promise<EntityMediaCollection | null> {
  const parsed = productIdParamSchema.safeParse({ productId });

  if (!parsed.success) {
    return null;
  }

  return getProductMedia(parsed.data.productId);
}
