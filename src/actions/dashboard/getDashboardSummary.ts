"use server";

import { getDashboardSummary } from "@/services/dashboardService";

import type { DashboardSummary } from "@/types/dashboard";

export async function getDashboardSummaryAction(): Promise<DashboardSummary> {
  return getDashboardSummary();
}
