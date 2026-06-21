import { and, count, eq, gte, isNull, or, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { auditLogs } from "@/db/schema/auth";
import { brands, categories, products } from "@/db/schema/catalog";
import { historyEntries } from "@/db/schema/history";
import { pages } from "@/db/schema/pages";
import { seoProfiles } from "@/db/schema/seo";
import { mediaAssets } from "@/db/schema/storage";
import { SEO_OWNER_TYPE_LABELS } from "@/constants/seo";
import { softDeleteFilter } from "@/repositories/baseRepository";

import type {
  ActivityAnalyticsSummary,
  ActivityTrendPoint,
  AnalyticsEntityCounts,
  EntityStatusBreakdown,
  MediaAnalyticsSummary,
  SeoCoverageItem,
  StatusBreakdown,
} from "@/types/analytics";

type PublishableStatus = "published" | "draft" | "archived" | "hidden";

function emptyStatusBreakdown(): {
  published: number;
  draft: number;
  archived: number;
  hidden: number;
} {
  return {
    published: 0,
    draft: 0,
    archived: 0,
    hidden: 0,
  };
}

function mapStatusRows(
  rows: Array<{ status: PublishableStatus; value: number }>,
): StatusBreakdown & { readonly total: number } {
  const breakdown = emptyStatusBreakdown();

  for (const row of rows) {
    breakdown[row.status] = row.value;
  }

  const total = breakdown.published + breakdown.draft + breakdown.archived + breakdown.hidden;

  return { ...breakdown, total };
}

async function getStatusBreakdownForTable(
  table: typeof products | typeof categories | typeof pages | typeof brands,
): Promise<StatusBreakdown & { readonly total: number }> {
  const db = getDb();

  const rows = await db
    .select({
      status: table.status,
      value: count(),
    })
    .from(table)
    .where(softDeleteFilter(table.deletedAt))
    .groupBy(table.status);

  return mapStatusRows(rows as Array<{ status: PublishableStatus; value: number }>);
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export async function getAnalyticsEntityCounts(): Promise<AnalyticsEntityCounts> {
  const db = getDb();

  const [pagesBreakdown, brandsBreakdown, mediaCount] = await Promise.all([
    getStatusBreakdownForTable(pages),
    getStatusBreakdownForTable(brands),
    db
      .select({ value: count() })
      .from(mediaAssets)
      .where(and(eq(mediaAssets.isDeleted, false), softDeleteFilter(mediaAssets.deletedAt))),
  ]);

  return {
    pages: pagesBreakdown,
    brands: brandsBreakdown,
    mediaAssets: mediaCount[0]?.value ?? 0,
  };
}

export async function getEntityStatusBreakdown(): Promise<EntityStatusBreakdown[]> {
  const [productsBreakdown, categoriesBreakdown, pagesBreakdown, brandsBreakdown] = await Promise.all([
    getStatusBreakdownForTable(products),
    getStatusBreakdownForTable(categories),
    getStatusBreakdownForTable(pages),
    getStatusBreakdownForTable(brands),
  ]);

  return [
    { entity: "products", label: "Products", ...productsBreakdown },
    { entity: "categories", label: "Categories", ...categoriesBreakdown },
    { entity: "pages", label: "Pages", ...pagesBreakdown },
    { entity: "brands", label: "Brands", ...brandsBreakdown },
  ];
}

export async function getMediaAnalyticsSummary(): Promise<MediaAnalyticsSummary> {
  const db = getDb();
  const baseFilter = and(eq(mediaAssets.isDeleted, false), softDeleteFilter(mediaAssets.deletedAt));

  const [totals] = await db
    .select({
      totalAssets: count(),
      optimizedAssets: sql<number>`count(*) filter (where ${mediaAssets.isOptimized} = true)::int`,
      missingAlt: sql<number>`count(*) filter (where ${mediaAssets.altUk} is null or ${mediaAssets.altEn} is null)::int`,
      webpCoverage: sql<number>`count(*) filter (where ${mediaAssets.hasWebp} = true)::int`,
      avifCoverage: sql<number>`count(*) filter (where ${mediaAssets.hasAvif} = true)::int`,
      totalBytes: sql<number>`coalesce(sum(${mediaAssets.fileSize}), 0)::bigint`,
    })
    .from(mediaAssets)
    .where(baseFilter);

  const totalAssets = totals?.totalAssets ?? 0;

  return {
    totalAssets,
    optimizedAssets: totals?.optimizedAssets ?? 0,
    missingAlt: totals?.missingAlt ?? 0,
    webpCoverage: totalAssets > 0 ? Math.round(((totals?.webpCoverage ?? 0) / totalAssets) * 100) : 0,
    avifCoverage: totalAssets > 0 ? Math.round(((totals?.avifCoverage ?? 0) / totalAssets) * 100) : 0,
    totalBytes: totals?.totalBytes ?? 0,
  };
}

export async function getActivityAnalyticsSummary(): Promise<ActivityAnalyticsSummary> {
  const db = getDb();
  const since = startOfToday();

  const [
    auditEventsToday,
    historyEventsToday,
    productUpdatesToday,
    seoChangesToday,
    mediaUploadsToday,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(auditLogs)
      .where(gte(auditLogs.createdAt, since)),
    db
      .select({ value: count() })
      .from(historyEntries)
      .where(gte(historyEntries.performedAt, since)),
    db
      .select({ value: count() })
      .from(historyEntries)
      .where(
        and(
          gte(historyEntries.performedAt, since),
          eq(historyEntries.entityType, "product"),
        ),
      ),
    db
      .select({ value: count() })
      .from(historyEntries)
      .where(
        and(
          gte(historyEntries.performedAt, since),
          or(
            eq(historyEntries.entityType, "seo_profile"),
            eq(historyEntries.entityType, "redirect"),
          ),
        ),
      ),
    db
      .select({ value: count() })
      .from(historyEntries)
      .where(
        and(
          gte(historyEntries.performedAt, since),
          eq(historyEntries.entityType, "media"),
        ),
      ),
  ]);

  return {
    auditEventsToday: auditEventsToday[0]?.value ?? 0,
    historyEventsToday: historyEventsToday[0]?.value ?? 0,
    productUpdatesToday: productUpdatesToday[0]?.value ?? 0,
    seoChangesToday: seoChangesToday[0]?.value ?? 0,
    mediaUploadsToday: mediaUploadsToday[0]?.value ?? 0,
  };
}

export async function getSeoCoverageByOwnerType(): Promise<SeoCoverageItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      ownerType: seoProfiles.ownerType,
      value: count(),
    })
    .from(seoProfiles)
    .where(isNull(seoProfiles.deletedAt))
    .groupBy(seoProfiles.ownerType)
    .orderBy(seoProfiles.ownerType);

  return rows.map((row) => ({
    ownerType: row.ownerType,
    label: SEO_OWNER_TYPE_LABELS[row.ownerType] ?? row.ownerType,
    count: row.value,
  }));
}

export async function getHistoryActivityTrend(days: number): Promise<ActivityTrendPoint[]> {
  const db = getDb();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      performedAt: historyEntries.performedAt,
    })
    .from(historyEntries)
    .where(gte(historyEntries.performedAt, since))
    .orderBy(historyEntries.performedAt);

  const grouped = new Map<string, number>();

  for (const row of rows) {
    const key = row.performedAt.toISOString().slice(0, 10);
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return [...grouped.entries()].map(([date, countValue]) => ({
    date,
    count: countValue,
  }));
}
