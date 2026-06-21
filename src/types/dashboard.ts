export interface ProductSummaryStats {
  readonly total: number;
  readonly published: number;
  readonly draft: number;
  readonly archived: number;
  readonly hidden: number;
}

export interface SeoMetricScore {
  readonly id: string;
  readonly label: string;
  readonly score: number;
}

export interface SeoHealthSummary {
  readonly overallScore: number;
  readonly metrics: SeoMetricScore[];
  readonly criticalIssues: number;
  readonly warnings: number;
  readonly recommendations: number;
  readonly lastScanAt: Date | null;
  readonly profileCount: number;
}

export interface SeoIssueCounts {
  readonly critical: number;
  readonly warning: number;
  readonly recommendation: number;
}

export interface ActivityFeedItem {
  readonly id: string;
  readonly action: string;
  readonly actorName: string | null;
  readonly createdAt: Date;
}

export interface ScoreTrendPoint {
  readonly date: string;
  readonly score: number;
}

export interface PublishedTrendPoint {
  readonly date: string;
  readonly count: number;
}

export interface ContentQualitySummary {
  readonly withoutDescription: number;
  readonly withoutSeoProfile: number;
  readonly withoutShortDescription: number;
}

export interface DashboardSummary {
  readonly products: ProductSummaryStats;
  readonly categories: {
    readonly total: number;
    readonly brands: number;
  };
  readonly seo: {
    readonly profiles: number;
    readonly redirects: number;
    readonly schemas: number;
  };
  readonly seoHealth: SeoHealthSummary;
  readonly contentQuality: ContentQualitySummary;
  readonly recentActivity: ActivityFeedItem[];
  readonly seoScoreTrend: ScoreTrendPoint[];
  readonly publishedTrend: PublishedTrendPoint[];
  readonly generatedAt: Date;
}
