"use server";

import { getProductFormOptions } from "@/services/productService";

import type { ProductFormOptions } from "@/services/productService";

export async function getProductFormOptionsAction(): Promise<ProductFormOptions> {
  return getProductFormOptions();
}
