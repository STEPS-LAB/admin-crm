import { and, count, desc, eq, gte, isNull, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { auditLogs, profiles } from "@/db/schema/auth";
import { brands, categories, productTranslations, products } from "@/db/schema/catalog";
import {
  redirectRules,
  schemaDocuments,
  seoAnalysis,
  seoProfiles,
  seoScoreHistory,
} from "@/db/schema/seo";
import { softDeleteFilter } from "@/repositories/baseRepository";

import type {
  ActivityFeedItem,
  ContentQualitySummary,
  PublishedTrendPoint,
  ScoreTrendPoint,
  SeoHealthSummary,
  SeoMetricScore,
} from "@/types/dashboard";

export interface ProductStatusCounts {
  readonly total: number;
  readonly published: number;
  readonly draft: number;
  readonly archived: number;
  readonly hidden: number;
}

export interface DashboardCounts {
  readonly products: ProductStatusCounts;
  readonly categories: number;
  readonly brands: number;
  readonly seoProfiles: number;
  readonly redirects: number;
  readonly schemas: number;
}

async function countProductsByStatus(
  status: "draft" | "published" | "archived" | "hidden",
): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ value: count() })
    .from(products)
    .where(and(softDeleteFilter(products.deletedAt), eq(products.status, status)));

  return result[0]?.value ?? 0;
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const db = getDb();

  const [productTotal, published, draft, archived, hidden, categoryCount, brandCount, seoCount, redirectCount, schemaCount] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(products)
        .where(softDeleteFilter(products.deletedAt)),
      countProductsByStatus("published"),
      countProductsByStatus("draft"),
      countProductsByStatus("archived"),
      countProductsByStatus("hidden"),
      db
        .select({ value: count() })
        .from(categories)
        .where(softDeleteFilter(categories.deletedAt)),
      db
        .select({ value: count() })
        .from(brands)
        .where(softDeleteFilter(brands.deletedAt)),
      db
        .select({ value: count() })
        .from(seoProfiles)
        .where(isNull(seoProfiles.deletedAt)),
      db.select({ value: count() }).from(redirectRules),
      db.select({ value: count() }).from(schemaDocuments),
    ]);

  return {
    products: {
      total: productTotal[0]?.value ?? 0,
      published,
      draft,
      archived,
      hidden,
    },
    categories: categoryCount[0]?.value ?? 0,
    brands: brandCount[0]?.value ?? 0,
    seoProfiles: seoCount[0]?.value ?? 0,
    redirects: redirectCount[0]?.value ?? 0,
    schemas: schemaCount[0]?.value ?? 0,
  };
}

function averageScore(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function countJsonArrayItems(rows: Array<{ errors: unknown; warnings: unknown; recommendations: unknown }>): {
  critical: number;
  warnings: number;
  recommendations: number;
} {
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

export async function getSeoHealthSummary(): Promise<SeoHealthSummary> {
  const db = getDb();

  const analyses = await db
    .select({
      overallScore: seoAnalysis.overallScore,
      technicalScore: seoAnalysis.technicalScore,
      metadataScore: seoAnalysis.metadataScore,
      schemaScore: seoAnalysis.schemaScore,
      contentScore: seoAnalysis.contentScore,
      imagesScore: seoAnalysis.imagesScore,
      performanceScore: seoAnalysis.performanceScore,
      accessibilityScore: seoAnalysis.accessibilityScore,
      errors: seoAnalysis.errors,
      warnings: seoAnalysis.warnings,
      recommendations: seoAnalysis.recommendations,
      lastScanAt: seoAnalysis.lastScanAt,
    })
    .from(seoAnalysis);

  if (analyses.length === 0) {
    return {
      overallScore: 0,
      metrics: [],
      criticalIssues: 0,
      warnings: 0,
      recommendations: 0,
      lastScanAt: null,
      profileCount: 0,
    };
  }

  const issueCounts = countJsonArrayItems(analyses);
  const latestScan = analyses
    .map((row) => row.lastScanAt)
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  const metrics: SeoMetricScore[] = [
    { id: "metadata", label: "Metadata", score: averageScore(analyses.map((row) => row.metadataScore)) },
    { id: "schema", label: "Schema", score: averageScore(analyses.map((row) => row.schemaScore)) },
    { id: "images", label: "Images", score: averageScore(analyses.map((row) => row.imagesScore)) },
    { id: "performance", label: "Performance", score: averageScore(analyses.map((row) => row.performanceScore)) },
    { id: "url", label: "URL", score: averageScore(analyses.map((row) => row.contentScore)) },
    { id: "accessibility", label: "Accessibility", score: averageScore(analyses.map((row) => row.accessibilityScore)) },
    { id: "technical", label: "Technical", score: averageScore(analyses.map((row) => row.technicalScore)) },
    {
      id: "internal-linking",
      label: "Internal Linking",
      score: averageScore(analyses.map((row) => Math.round((row.metadataScore + row.contentScore) / 2))),
    },
  ];

  return {
    overallScore: averageScore(analyses.map((row) => row.overallScore)),
    metrics,
    criticalIssues: issueCounts.critical,
    warnings: issueCounts.warnings,
    recommendations: issueCounts.recommendations,
    lastScanAt: latestScan,
    profileCount: analyses.length,
  };
}

export async function getRecentActivity(limit = 10): Promise<ActivityFeedItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      createdAt: auditLogs.createdAt,
      actorName: profiles.displayName,
    })
    .from(auditLogs)
    .leftJoin(profiles, eq(auditLogs.profileId, profiles.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    actorName: row.actorName,
    createdAt: row.createdAt,
  }));
}

export async function getSeoScoreTrend(days = 7): Promise<ScoreTrendPoint[]> {
  const db = getDb();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      createdAt: seoScoreHistory.createdAt,
      newScore: seoScoreHistory.newScore,
    })
    .from(seoScoreHistory)
    .where(gte(seoScoreHistory.createdAt, since))
    .orderBy(seoScoreHistory.createdAt);

  const grouped = new Map<string, number[]>();

  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    const bucket = grouped.get(key) ?? [];
    bucket.push(row.newScore);
    grouped.set(key, bucket);
  }

  return [...grouped.entries()].map(([date, scores]) => ({
    date,
    score: averageScore(scores),
  }));
}

export async function getPublishedProductsTrend(days = 7): Promise<PublishedTrendPoint[]> {
  const db = getDb();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      publishedAt: products.publishedAt,
    })
    .from(products)
    .where(
      and(
        softDeleteFilter(products.deletedAt),
        eq(products.status, "published"),
        gte(products.publishedAt, since),
      ),
    );

  const grouped = new Map<string, number>();

  for (const row of rows) {
    if (!row.publishedAt) {
      continue;
    }

    const key = row.publishedAt.toISOString().slice(0, 10);
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return [...grouped.entries()].map(([date, countValue]) => ({
    date,
    count: countValue,
  }));
}

export async function getContentQualitySummary(): Promise<ContentQualitySummary> {
  const db = getDb();

  const [withoutDescription, withoutShortDescription, withoutSeoProfile] = await Promise.all([
    db
      .select({ value: count() })
      .from(productTranslations)
      .innerJoin(products, eq(productTranslations.productId, products.id))
      .where(and(softDeleteFilter(products.deletedAt), isNull(productTranslations.description))),
    db
      .select({ value: count() })
      .from(productTranslations)
      .innerJoin(products, eq(productTranslations.productId, products.id))
      .where(and(softDeleteFilter(products.deletedAt), isNull(productTranslations.shortDescription))),
    db
      .select({ value: count(sql`distinct ${products.id}`) })
      .from(products)
      .leftJoin(
        seoProfiles,
        and(eq(seoProfiles.ownerId, products.id), eq(seoProfiles.ownerType, "product")),
      )
      .where(and(softDeleteFilter(products.deletedAt), isNull(seoProfiles.id))),
  ]);

  return {
    withoutDescription: withoutDescription[0]?.value ?? 0,
    withoutShortDescription: withoutShortDescription[0]?.value ?? 0,
    withoutSeoProfile: withoutSeoProfile[0]?.value ?? 0,
  };
}
