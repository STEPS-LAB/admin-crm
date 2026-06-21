export const ANALYTICS_DATE_RANGE_OPTIONS = [7, 30, 90] as const;

export type AnalyticsDateRange = (typeof ANALYTICS_DATE_RANGE_OPTIONS)[number];

export const ANALYTICS_DATE_RANGE_LABELS: Record<AnalyticsDateRange, string> = {
  7: "Last 7 days",
  30: "Last 30 days",
  90: "Last 90 days",
};
