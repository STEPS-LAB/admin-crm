"use server";

import { listFeatureFlags } from "@/services/featureFlagService";

import type { FeatureFlagListFilters, FeatureFlagListItem } from "@/types/feature-flags";

function parseFilters(
  params: Record<string, string | string[] | undefined>,
): FeatureFlagListFilters {
  const status = params.status;

  return {
    ...(status === "enabled" || status === "disabled" ? { status } : {}),
    ...(typeof params.search === "string" && params.search.trim()
      ? { search: params.search.trim() }
      : {}),
  };
}

export async function listFeatureFlagsAction(
  params: Record<string, string | string[] | undefined> = {},
): Promise<FeatureFlagListItem[]> {
  return listFeatureFlags(parseFilters(params));
}
