import {
  getActivityAnalyticsSummary,
  getAnalyticsEntityCounts,
  getEntityStatusBreakdown,
  getHistoryActivityTrend,
  getMediaAnalyticsSummary,
  getSeoCoverageByOwnerType,
} from "@/repositories/analyticsRepository";
import {
  getContentQualitySummary,
  getDashboardCounts,
  getPublishedProductsTrend,
  getRecentActivity,
  getSeoHealthSummary,
  getSeoScoreTrend,
} from "@/repositories/dashboardRepository";

import type { AnalyticsDateRange } from "@/constants/analytics";
import type { AnalyticsSummary } from "@/types/analytics";
import type { DashboardSummary } from "@/types/dashboard";

function buildDashboardSummary(
  counts: Awaited<ReturnType<typeof getDashboardCounts>>,
  seoHealth: Awaited<ReturnType<typeof getSeoHealthSummary>>,
  contentQuality: Awaited<ReturnType<typeof getContentQualitySummary>>,
  recentActivity: Awaited<ReturnType<typeof getRecentActivity>>,
  seoScoreTrend: Awaited<ReturnType<typeof getSeoScoreTrend>>,
  publishedTrend: Awaited<ReturnType<typeof getPublishedProductsTrend>>,
): DashboardSummary {
  return {
    products: counts.products,
    categories: {
      total: counts.categories,
      brands: counts.brands,
    },
    seo: {
      profiles: counts.seoProfiles,
      redirects: counts.redirects,
      schemas: counts.schemas,
    },
    seoHealth,
    contentQuality,
    recentActivity,
    seoScoreTrend,
    publishedTrend,
    generatedAt: new Date(),
  };
}

export async function getAnalyticsSummary(dateRange: AnalyticsDateRange): Promise<AnalyticsSummary> {
  const [
    counts,
    seoHealth,
    contentQuality,
    recentActivity,
    seoScoreTrend,
    publishedTrend,
    entities,
    entityStatusBreakdown,
    media,
    activity,
    seoCoverage,
    historyActivityTrend,
  ] = await Promise.all([
    getDashboardCounts(),
    getSeoHealthSummary(),
    getContentQualitySummary(),
    getRecentActivity(10),
    getSeoScoreTrend(dateRange),
    getPublishedProductsTrend(dateRange),
    getAnalyticsEntityCounts(),
    getEntityStatusBreakdown(),
    getMediaAnalyticsSummary(),
    getActivityAnalyticsSummary(),
    getSeoCoverageByOwnerType(),
    getHistoryActivityTrend(dateRange),
  ]);

  const dashboard = buildDashboardSummary(
    counts,
    seoHealth,
    contentQuality,
    recentActivity,
    seoScoreTrend,
    publishedTrend,
  );

  return {
    dateRange,
    dashboard,
    entities,
    entityStatusBreakdown,
    media,
    activity,
    seoCoverage,
    contentQuality,
    seoHealth,
    recentActivity,
    seoScoreTrend,
    publishedTrend,
    historyActivityTrend,
    generatedAt: new Date(),
  };
}
