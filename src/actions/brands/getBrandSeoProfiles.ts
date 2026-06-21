"use server";

import { brandIdParamSchema } from "@/schemas/media/entityMediaSchemas";
import { getBrand } from "@/services/brandService";
import { getOwnerSeoProfiles } from "@/services/seoProfileService";

import type { EntitySeoProfiles } from "@/types/seo-center";

export async function getBrandSeoProfilesAction(brandId: string): Promise<EntitySeoProfiles | null> {
  const parsed = brandIdParamSchema.safeParse({ brandId });

  if (!parsed.success) {
    return null;
  }

  const brand = await getBrand(parsed.data.brandId);

  if (!brand) {
    return null;
  }

  return getOwnerSeoProfiles("brand", brand.id, {
    uk: brand.translations.uk.name,
    en: brand.translations.en.name,
  });
}
