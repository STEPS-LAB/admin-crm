import type { AnalyticsDateRange } from "@/constants/analytics";
import type {
  ActivityFeedItem,
  ContentQualitySummary,
  DashboardSummary,
  PublishedTrendPoint,
  ScoreTrendPoint,
  SeoHealthSummary,
} from "@/types/dashboard";

export interface StatusBreakdown {
  readonly published: number;
  readonly draft: number;
  readonly archived: number;
  readonly hidden: number;
}

export interface EntityStatusBreakdown {
  readonly entity: string;
  readonly label: string;
  readonly published: number;
  readonly draft: number;
  readonly archived: number;
  readonly hidden: number;
  readonly total: number;
}

export interface MediaAnalyticsSummary {
  readonly totalAssets: number;
  readonly optimizedAssets: number;
  readonly missingAlt: number;
  readonly webpCoverage: number;
  readonly avifCoverage: number;
  readonly totalBytes: number;
}

export interface ActivityAnalyticsSummary {
  readonly auditEventsToday: number;
  readonly historyEventsToday: number;
  readonly productUpdatesToday: number;
  readonly seoChangesToday: number;
  readonly mediaUploadsToday: number;
}

export interface SeoCoverageItem {
  readonly ownerType: string;
  readonly label: string;
  readonly count: number;
}

export interface ActivityTrendPoint {
  readonly date: string;
  readonly count: number;
}

export interface AnalyticsEntityCounts {
  readonly pages: StatusBreakdown & { readonly total: number };
  readonly brands: StatusBreakdown & { readonly total: number };
  readonly mediaAssets: number;
}

export interface AnalyticsSummary {
  readonly dateRange: AnalyticsDateRange;
  readonly dashboard: DashboardSummary;
  readonly entities: AnalyticsEntityCounts;
  readonly entityStatusBreakdown: EntityStatusBreakdown[];
  readonly media: MediaAnalyticsSummary;
  readonly activity: ActivityAnalyticsSummary;
  readonly seoCoverage: SeoCoverageItem[];
  readonly contentQuality: ContentQualitySummary;
  readonly seoHealth: SeoHealthSummary;
  readonly recentActivity: ActivityFeedItem[];
  readonly seoScoreTrend: ScoreTrendPoint[];
  readonly publishedTrend: PublishedTrendPoint[];
  readonly historyActivityTrend: ActivityTrendPoint[];
  readonly generatedAt: Date;
}
