"use server";

import { getOverview } from "@/services/seoCenterService";

import type { SeoCenterOverview } from "@/types/seo-center";

export async function getSeoOverviewAction(): Promise<SeoCenterOverview> {
  return getOverview();
}
