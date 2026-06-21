"use server";

import { getBrand } from "@/services/brandService";

import type { BrandDetail } from "@/types/brands";

export async function getBrandAction(id: string): Promise<BrandDetail | null> {
  return getBrand(id);
}
