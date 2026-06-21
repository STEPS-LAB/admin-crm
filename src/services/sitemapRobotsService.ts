import { buildRobotsTxt, validateRobotsConfig } from "@/lib/seo/robotsTxt";
import { buildSitemapIndexUrl } from "@/lib/seo/publicUrls";
import { buildSitemapXml } from "@/lib/seo/sitemapXml";
import { findActiveRobotsConfig, upsertDefaultRobotsConfig } from "@/repositories/robotsRepository";
import { buildSitemapSummary, findSitemapEntries } from "@/repositories/sitemapRepository";
import { getSettings, updateRobotsContent } from "@/services/settingsService";

import type { HistoryMutationContext } from "@/services/historyService";
import type {
  RobotsConfigInput,
  RobotsSummary,
  SitemapGenerationResult,
  SitemapSummary,
} from "@/types/sitemap-robots";

function defaultRobotsInput(siteUrl: string, robotsContent: string | null): RobotsConfigInput {
  if (robotsContent?.trim()) {
    return {
      userAgent: "*",
      allowRules: "/",
      disallowRules: "/admin\n/api",
      host: null,
      sitemapUrls: [buildSitemapIndexUrl(siteUrl)],
      customDirectives: robotsContent.trim(),
      isActive: true,
    };
  }

  return {
    userAgent: "*",
    allowRules: "/",
    disallowRules: "/admin\n/api",
    host: null,
    sitemapUrls: [buildSitemapIndexUrl(siteUrl)],
    customDirectives: null,
    isActive: true,
  };
}

export async function getSitemapSummary(): Promise<SitemapSummary> {
  const settings = await getSettings();

  const entries = await findSitemapEntries({
    siteUrl: settings.siteUrl,
    defaultChangeFrequency: settings.sitemapUpdateFrequency ?? "daily",
    includeImages: settings.sitemapIncludeImages,
  });

  return buildSitemapSummary(entries, {
    enabled: settings.sitemapEnabled,
    autoGenerate: settings.sitemapAutoGenerate,
    siteUrl: settings.siteUrl,
  });
}

export async function generateSitemap(): Promise<SitemapGenerationResult> {
  const summary = await getSitemapSummary();
  const xml = buildSitemapXml(summary.entries);

  return {
    xml,
    summary: {
      ...summary,
      generatedAt: new Date(),
    },
  };
}

export async function getRobotsSummary(): Promise<RobotsSummary> {
  const settings = await getSettings();
  const storedConfig = await findActiveRobotsConfig();
  const config = storedConfig ?? defaultRobotsInput(settings.siteUrl, settings.robotsContent);
  const content = settings.robotsEnabled
    ? settings.robotsContent?.trim() || buildRobotsTxt(config, settings.siteUrl)
    : "Robots.txt is disabled in settings.";
  const validation = validateRobotsConfig(config, settings.siteUrl);

  return {
    enabled: settings.robotsEnabled,
    siteUrl: settings.siteUrl,
    content,
    config: storedConfig,
    validation,
    generatedAt: new Date(),
  };
}

export async function updateRobotsConfiguration(
  input: RobotsConfigInput,
  context: HistoryMutationContext,
): Promise<RobotsSummary> {
  const settings = await getSettings();
  const validation = validateRobotsConfig(input, settings.siteUrl);

  if (!validation.valid) {
    const firstError = validation.issues.find((issue) => issue.severity === "error");

    if (firstError) {
      throw new Error(firstError.message);
    }
  }

  const config = await upsertDefaultRobotsConfig(input);
  const content = buildRobotsTxt(config, settings.siteUrl);

  await updateRobotsContent(content, context);

  return {
    enabled: settings.robotsEnabled,
    siteUrl: settings.siteUrl,
    content,
    config,
    validation,
    generatedAt: new Date(),
  };
}

export function validateRobots(input: RobotsConfigInput, siteUrl: string) {
  return validateRobotsConfig(input, siteUrl);
}
