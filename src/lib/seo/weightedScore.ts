import { SEO_ENTITY_SCORE_WEIGHTS } from "@/constants/seo";

import type { SeoEntityScore } from "@/types/seo-center";

export function calculateWeightedGlobalScore(entityScores: SeoEntityScore[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const entity of entityScores) {
    const weight = SEO_ENTITY_SCORE_WEIGHTS[entity.ownerType];

    if (!weight || entity.profileCount === 0) {
      continue;
    }

    weightedSum += entity.averageScore * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round(weightedSum / totalWeight);
}
