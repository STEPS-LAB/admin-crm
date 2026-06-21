import { findOwnerAverageSeoScore } from "@/repositories/seoProfileRepository";

import type { SeoOwnerType } from "@/constants/seo";

export async function getOwnerSeoScore(
  ownerType: SeoOwnerType,
  ownerId: string,
): Promise<number | null> {
  return findOwnerAverageSeoScore(ownerType, ownerId);
}
