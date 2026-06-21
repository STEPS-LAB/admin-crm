"use server";

import { getAnalyticsSummary } from "@/services/analyticsService";
import { analyticsFiltersSchema } from "@/schemas/analytics/analyticsSchemas";

import type { AnalyticsSummary } from "@/types/analytics";

function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): ReturnType<typeof analyticsFiltersSchema.parse> {
  return analyticsFiltersSchema.parse({
    days: typeof params.days === "string" ? params.days : undefined,
  });
}

export async function getAnalyticsSummaryAction(
  params: Record<string, string | string[] | undefined> = {},
): Promise<AnalyticsSummary> {
  const filters = parseSearchParams(params);
  return getAnalyticsSummary(filters.days);
}
