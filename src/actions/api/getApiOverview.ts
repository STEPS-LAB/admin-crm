"use server";

import { getApiCenterOverview } from "@/services/apiService";

import type { ApiCenterOverview } from "@/types/api";

export async function getApiOverviewAction(): Promise<ApiCenterOverview> {
  return getApiCenterOverview();
}
