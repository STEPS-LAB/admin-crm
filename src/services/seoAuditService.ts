import { inArray, isNull } from "drizzle-orm";

import { getDb } from "@/db/client";
import { seoAnalysis, seoProfiles } from "@/db/schema/seo";
import { getSeoCenterOverview } from "@/repositories/seoCenterRepository";
import { emitWebhookEvent } from "@/services/webhookService";

import type { SeoCenterOverview } from "@/types/seo-center";

export interface SeoAuditResult {
  readonly overview: SeoCenterOverview;
  readonly scannedProfiles: number;
  readonly completedAt: string;
}

export async function runSeoCenterAudit(): Promise<SeoAuditResult> {
  const db = getDb();
  const completedAt = new Date();

  const profileRows = await db
    .select({ id: seoProfiles.id })
    .from(seoProfiles)
    .where(isNull(seoProfiles.deletedAt));

  const profileIds = profileRows.map((row) => row.id);

  if (profileIds.length > 0) {
    await db
      .update(seoAnalysis)
      .set({
        lastScanAt: completedAt,
        updatedAt: completedAt,
      })
      .where(inArray(seoAnalysis.seoProfileId, profileIds));
  }

  const overview = await getSeoCenterOverview();

  const result: SeoAuditResult = {
    overview,
    scannedProfiles: profileIds.length,
    completedAt: completedAt.toISOString(),
  };

  emitWebhookEvent("seo.audit.completed", {
    completedAt: result.completedAt,
    scannedProfiles: result.scannedProfiles,
    globalScore: overview.globalScore,
    criticalIssues: overview.criticalIssues,
    warnings: overview.warnings,
    recommendations: overview.recommendations,
    profileCount: overview.profileCount,
  });

  return result;
}
