"use server";

import { enforceExportRateLimit } from "@/actions/guards/listActionGuards";
import { generateSitemap, getSitemapSummary } from "@/services/sitemapRobotsService";

import type { SitemapGenerationResult, SitemapSummary } from "@/types/sitemap-robots";

export async function getSitemapSummaryAction(): Promise<SitemapSummary> {
  return getSitemapSummary();
}

export async function generateSitemapAction(): Promise<SitemapGenerationResult> {
  await enforceExportRateLimit();
  return generateSitemap();
}
