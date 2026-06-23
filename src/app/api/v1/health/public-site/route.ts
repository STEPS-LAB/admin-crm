export const dynamic = "force-dynamic";

import { publicApiSuccess } from "@/lib/api/publicApiResponse";
import { findSettings } from "@/repositories/settingsRepository";
import {
  findPublishedBrandBySlug,
  findPublishedCategoryBySlug,
  findPublishedCategoryCards,
  findPublishedHomepageContent,
  findPublishedProductBySlug,
  findPublishedProductCards,
  findPublicCatalogStats,
} from "@/repositories/publicSiteRepository";
import { findPublishedHomepagePageId } from "@/repositories/publicSeoRepository";
import { getPublicHomepageSeo, getPublicProductSeo } from "@/services/publicSeoService";
import { getPublicSitePageData, loadPublicSiteContext } from "@/services/publicSiteService";
import { getPublicSiteSeoOverview } from "@/services/publicSiteSeoOverviewService";

interface StepResult {
  readonly ok: boolean;
  readonly error?: string;
}

async function runStep(name: string, fn: () => Promise<unknown>): Promise<[string, StepResult]> {
  try {
    await fn();
    return [name, { ok: true }];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause =
      error instanceof Error && error.cause instanceof Error ? error.cause.message : undefined;

    return [name, { ok: false, error: cause ? `${message} (${cause})` : message }];
  }
}

export async function GET(): Promise<Response> {
  const steps: Record<string, StepResult> = {};

  for (const [name, result] of [
    await runStep("findSettings", () => findSettings()),
    await runStep("loadPublicSiteContext", () => loadPublicSiteContext("uk")),
    await runStep("findPublishedHomepageContent", () => findPublishedHomepageContent("uk")),
    await runStep("findPublishedHomepagePageId", () => findPublishedHomepagePageId("uk")),
    await runStep("findPublishedProductCards", () => findPublishedProductCards("uk", 4)),
    await runStep("findPublishedCategoryCards", () => findPublishedCategoryCards("uk", 4)),
    await runStep("findPublishedProductBySlug", () =>
      findPublishedProductBySlug("uk", "demo-produkt"),
    ),
    await runStep("findPublishedCategoryBySlug", () =>
      findPublishedCategoryBySlug("uk", "elektronika"),
    ),
    await runStep("findPublishedBrandBySlug", () => findPublishedBrandBySlug("uk", "demo-brand")),
    await runStep("findPublicCatalogStats", () => findPublicCatalogStats()),
    await runStep("getPublicSiteSeoOverview", () => getPublicSiteSeoOverview()),
    await runStep("getPublicHomepageSeo", async () => {
      const context = await loadPublicSiteContext("uk");
      await getPublicHomepageSeo(context);
    }),
    await runStep("getPublicSitePageData", async () => {
      const context = await loadPublicSiteContext("uk");
      await getPublicSitePageData("uk", context.settings);
    }),
    await runStep("getPublicProductSeo", async () => {
      const context = await loadPublicSiteContext("uk");
      await getPublicProductSeo(context, "demo-produkt");
    }),
  ]) {
    steps[name] = result;
  }

  const failedSteps = Object.entries(steps)
    .filter(([, result]) => !result.ok)
    .map(([name]) => name);

  return publicApiSuccess({
    status: failedSteps.length === 0 ? "ok" : "error",
    failedSteps,
    steps,
    timestamp: new Date().toISOString(),
  });
}
