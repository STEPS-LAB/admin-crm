"use server";

import { getFeatureFlagCenterOverview } from "@/services/featureFlagService";

import type { FeatureFlagCenterOverview } from "@/types/feature-flags";

export async function getFeatureFlagOverviewAction(): Promise<FeatureFlagCenterOverview> {
  return getFeatureFlagCenterOverview();
}
