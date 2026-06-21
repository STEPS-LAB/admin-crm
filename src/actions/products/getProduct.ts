"use server";

import { getProduct } from "@/services/productService";
import { productIdSchema } from "@/schemas/products/productSchemas";

import type { ProductDetail } from "@/types/products";

export async function getProductAction(id: string): Promise<ProductDetail | null> {
  const parsed = productIdSchema.safeParse({ id });

  if (!parsed.success) {
    return null;
  }

  return getProduct(parsed.data.id);
}
