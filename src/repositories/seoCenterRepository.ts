import { count, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db/client";
import { redirectRules, schemaDocuments, seoAnalysis, seoProfiles } from "@/db/schema/seo";
import { getSeoHealthSummary } from "@/repositories/dashboardRepository";
import { SEO_OWNER_TYPE_LABELS } from "@/constants/seo";
import { calculateWeightedGlobalScore } from "@/lib/seo/weightedScore";

import type { SeoCenterOverview, SeoEntityScore } from "@/types/seo-center";
import type { SeoOwnerType } from "@/constants/seo";

function averageScore(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export async function getEntityScores(): Promise<SeoEntityScore[]> {
  const db = getDb();

  const rows = await db
    .select({
      ownerType: seoProfiles.ownerType,
      overallScore: seoAnalysis.overallScore,
    })
    .from(seoProfiles)
    .leftJoin(seoAnalysis, eq(seoAnalysis.seoProfileId, seoProfiles.id))
    .where(isNull(seoProfiles.deletedAt));

  const grouped = new Map<SeoOwnerType, number[]>();

  for (const row of rows) {
    if (row.overallScore === null) {
      continue;
    }

    const scores = grouped.get(row.ownerType) ?? [];
    scores.push(row.overallScore);
    grouped.set(row.ownerType, scores);
  }

  return [...grouped.entries()].map(([ownerType, scores]) => ({
    ownerType,
    label: SEO_OWNER_TYPE_LABELS[ownerType],
    profileCount: scores.length,
    averageScore: averageScore(scores),
  }));
}

export async function getSeoCenterOverview(): Promise<SeoCenterOverview> {
  const db = getDb();
  const [health, entityScores, redirectCount, schemaCount, profileCount] = await Promise.all([
    getSeoHealthSummary(),
    getEntityScores(),
    db.select({ value: count() }).from(redirectRules),
    db.select({ value: count() }).from(schemaDocuments),
    db
      .select({ value: count() })
      .from(seoProfiles)
      .where(isNull(seoProfiles.deletedAt)),
  ]);

  return {
    globalScore: calculateWeightedGlobalScore(entityScores),
    criticalIssues: health.criticalIssues,
    warnings: health.warnings,
    recommendations: health.recommendations,
    profileCount: profileCount[0]?.value ?? 0,
    redirectCount: redirectCount[0]?.value ?? 0,
    schemaCount: schemaCount[0]?.value ?? 0,
    lastScanAt: health.lastScanAt,
    entityScores,
    generatedAt: new Date(),
  };
}
