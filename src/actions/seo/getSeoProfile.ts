"use server";

import { getSeoProfile } from "@/services/seoProfileService";
import { seoProfileIdSchema } from "@/schemas/seo/seoSchemas";

import type { SeoProfileDetail } from "@/types/seo-center";

export async function getSeoProfileAction(id: string): Promise<SeoProfileDetail | null> {
  const parsed = seoProfileIdSchema.safeParse({ id });

  if (!parsed.success) {
    return null;
  }

  return getSeoProfile(parsed.data.id);
}
