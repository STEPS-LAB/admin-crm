import { count, eq, isNull } from "drizzle-orm";

import { withDbRetry } from "@/db/client";
import { redirectRules, schemaDocuments, seoAnalysis, seoProfiles } from "@/db/schema/seo";
import { SEO_OWNER_TYPE_LABELS } from "@/constants/seo";
import { calculateWeightedGlobalScore } from "@/lib/seo/weightedScore";

import type { SeoOwnerType } from "@/constants/seo";
import type { SeoCenterOverview, SeoEntityScore } from "@/types/seo-center";

function averageScore(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function countJsonArrayItems(
  rows: Array<{ errors: unknown; warnings: unknown; recommendations: unknown }>,
): { readonly critical: number; readonly warnings: number; readonly recommendations: number } {
  let critical = 0;
  let warnings = 0;
  let recommendations = 0;

  for (const row of rows) {
    critical += Array.isArray(row.errors) ? row.errors.length : 0;
    warnings += Array.isArray(row.warnings) ? row.warnings.length : 0;
    recommendations += Array.isArray(row.recommendations) ? row.recommendations.length : 0;
  }

  return { critical, warnings, recommendations };
}

export async function getPublicSiteSeoOverview(): Promise<SeoCenterOverview> {
  return withDbRetry(async (db) => {
    const analysisRows = await db
      .select({
        ownerType: seoProfiles.ownerType,
        overallScore: seoAnalysis.overallScore,
        errors: seoAnalysis.errors,
        warnings: seoAnalysis.warnings,
        recommendations: seoAnalysis.recommendations,
        lastScanAt: seoAnalysis.lastScanAt,
      })
      .from(seoProfiles)
      .leftJoin(seoAnalysis, eq(seoAnalysis.seoProfileId, seoProfiles.id))
      .where(isNull(seoProfiles.deletedAt));

    const redirectCount = await db.select({ value: count() }).from(redirectRules);
    const schemaCount = await db.select({ value: count() }).from(schemaDocuments);
    const profileCount = await db
      .select({ value: count() })
      .from(seoProfiles)
      .where(isNull(seoProfiles.deletedAt));

    const grouped = new Map<SeoOwnerType, number[]>();

    for (const row of analysisRows) {
      if (row.overallScore === null) {
        continue;
      }

      const scores = grouped.get(row.ownerType) ?? [];
      scores.push(row.overallScore);
      grouped.set(row.ownerType, scores);
    }

    const entityScores: SeoEntityScore[] = [...grouped.entries()].map(([ownerType, scores]) => ({
      ownerType,
      label: SEO_OWNER_TYPE_LABELS[ownerType],
      profileCount: scores.length,
      averageScore: averageScore(scores),
    }));

    const issueCounts = countJsonArrayItems(analysisRows);
    const lastScanAt =
      analysisRows
        .map((row) => row.lastScanAt)
        .filter((value): value is Date => value instanceof Date)
        .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;

    return {
      globalScore: calculateWeightedGlobalScore(entityScores),
      criticalIssues: issueCounts.critical,
      warnings: issueCounts.warnings,
      recommendations: issueCounts.recommendations,
      profileCount: profileCount[0]?.value ?? 0,
      redirectCount: redirectCount[0]?.value ?? 0,
      schemaCount: schemaCount[0]?.value ?? 0,
      lastScanAt,
      entityScores,
      generatedAt: new Date(),
    };
  });
}
