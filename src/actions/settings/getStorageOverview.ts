"use server";

import { getStorageOverview } from "@/services/storageOverviewService";

import type { StorageOverview } from "@/services/storageOverviewService";

export async function getStorageOverviewAction(): Promise<StorageOverview> {
  return getStorageOverview();
}
