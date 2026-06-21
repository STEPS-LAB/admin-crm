import { normalizeSiteUrl } from "@/lib/seo/publicUrls";

import type { RobotsConfigInput, RobotsValidationIssue } from "@/types/sitemap-robots";

function splitRules(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function buildRobotsTxt(config: RobotsConfigInput, siteUrl: string): string {
  const lines: string[] = [`User-agent: ${config.userAgent}`];

  for (const rule of splitRules(config.allowRules)) {
    lines.push(`Allow: ${rule}`);
  }

  for (const rule of splitRules(config.disallowRules)) {
    lines.push(`Disallow: ${rule}`);
  }

  if (config.host) {
    lines.push(`Host: ${config.host}`);
  }

  const sitemapUrls =
    config.sitemapUrls.length > 0
      ? config.sitemapUrls
      : [`${normalizeSiteUrl(siteUrl)}/sitemap.xml`];

  for (const sitemapUrl of sitemapUrls) {
    lines.push(`Sitemap: ${sitemapUrl}`);
  }

  if (config.customDirectives?.trim()) {
    lines.push("");
    lines.push(config.customDirectives.trim());
  }

  return `${lines.join("\n")}\n`;
}

export function validateRobotsConfig(
  config: RobotsConfigInput,
  siteUrl: string,
): { readonly valid: boolean; readonly issues: RobotsValidationIssue[] } {
  const issues: RobotsValidationIssue[] = [];

  if (!config.userAgent.trim()) {
    issues.push({
      field: "userAgent",
      message: "User-agent is required",
      severity: "error",
    });
  }

  const allowRules = splitRules(config.allowRules);
  const disallowRules = splitRules(config.disallowRules);

  const duplicateAllow = allowRules.filter((rule, index) => allowRules.indexOf(rule) !== index);
  const duplicateDisallow = disallowRules.filter((rule, index) => disallowRules.indexOf(rule) !== index);

  for (const rule of duplicateAllow) {
    issues.push({
      field: "allowRules",
      message: `Duplicate Allow rule: ${rule}`,
      severity: "warning",
    });
  }

  for (const rule of duplicateDisallow) {
    issues.push({
      field: "disallowRules",
      message: `Duplicate Disallow rule: ${rule}`,
      severity: "warning",
    });
  }

  const conflicting = allowRules.filter((rule) => disallowRules.includes(rule));

  for (const rule of conflicting) {
    issues.push({
      field: "allowRules",
      message: `Rule appears in both Allow and Disallow: ${rule}`,
      severity: "error",
    });
  }

  for (const sitemapUrl of config.sitemapUrls) {
    try {
      const parsed = new URL(sitemapUrl);

      if (!parsed.protocol.startsWith("http")) {
        issues.push({
          field: "sitemapUrls",
          message: `Sitemap URL must use HTTP or HTTPS: ${sitemapUrl}`,
          severity: "error",
        });
      }
    } catch {
      issues.push({
        field: "sitemapUrls",
        message: `Invalid sitemap URL: ${sitemapUrl}`,
        severity: "error",
      });
    }
  }

  if (config.sitemapUrls.length === 0) {
    try {
      new URL(`${normalizeSiteUrl(siteUrl)}/sitemap.xml`);
    } catch {
      issues.push({
        field: "siteUrl",
        message: "Site URL is invalid — default sitemap URL cannot be generated",
        severity: "error",
      });
    }
  }

  if (config.customDirectives?.includes("User-agent:")) {
    issues.push({
      field: "customDirectives",
      message: "Custom directives should not include User-agent blocks — use the form fields instead",
      severity: "warning",
    });
  }

  const hasErrors = issues.some((issue) => issue.severity === "error");

  return {
    valid: !hasErrors,
    issues,
  };
}
