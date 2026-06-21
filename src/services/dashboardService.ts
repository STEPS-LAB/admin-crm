import {
  getContentQualitySummary,
  getDashboardCounts,
  getPublishedProductsTrend,
  getRecentActivity,
  getSeoHealthSummary,
  getSeoScoreTrend,
} from "@/repositories/dashboardRepository";

import type { DashboardSummary } from "@/types/dashboard";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [counts, seoHealth, contentQuality, recentActivity, seoScoreTrend, publishedTrend] =
    await Promise.all([
      getDashboardCounts(),
      getSeoHealthSummary(),
      getContentQualitySummary(),
      getRecentActivity(12),
      getSeoScoreTrend(30),
      getPublishedProductsTrend(30),
    ]);

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
