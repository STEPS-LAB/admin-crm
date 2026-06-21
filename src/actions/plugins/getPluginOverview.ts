"use server";

import { getPluginCenterOverview } from "@/services/pluginService";

import type { PluginCenterOverview } from "@/types/plugins";

export async function getPluginOverviewAction(): Promise<PluginCenterOverview> {
  return getPluginCenterOverview();
}
