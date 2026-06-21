import { describe, expect, it } from "vitest";

import { buildPublicEntityUrl, normalizeSiteUrl } from "@/lib/seo/publicUrls";
import { buildRobotsTxt, validateRobotsConfig } from "@/lib/seo/robotsTxt";
import { buildSitemapXml } from "@/lib/seo/sitemapXml";

describe("buildSitemapXml", () => {
  it("generates valid urlset XML for indexed entries", () => {
    const xml = buildSitemapXml([
      {
        ownerType: "product",
        ownerId: "00000000-0000-4000-8000-000000000001",
        language: "uk",
        slug: "demo-product",
        label: "Demo",
        loc: "https://example.com/uk/products/demo-product",
        lastmod: new Date("2026-01-01T00:00:00.000Z"),
        changefreq: "weekly",
        priority: "0.8",
        indexed: true,
        excluded: false,
      },
    ]);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("https://example.com/uk/products/demo-product");
    expect(xml).not.toContain("&");
  });

  it("skips excluded and noindex entries", () => {
    const xml = buildSitemapXml([
      {
        ownerType: "page",
        ownerId: "00000000-0000-4000-8000-000000000002",
        language: "en",
        slug: "hidden-page",
        label: "Hidden",
        loc: "https://example.com/en/pages/hidden-page",
        lastmod: new Date("2026-01-01T00:00:00.000Z"),
        changefreq: "weekly",
        priority: "0.5",
        indexed: false,
        excluded: false,
      },
    ]);

    expect(xml).not.toContain("hidden-page");
  });
});

describe("buildRobotsTxt", () => {
  it("builds robots directives with defaults", () => {
    const content = buildRobotsTxt(
      {
        userAgent: "*",
        allowRules: "/",
        disallowRules: "/admin",
        host: null,
        sitemapUrls: [],
        customDirectives: null,
        isActive: true,
      },
      "https://example.com/",
    );

    expect(content).toContain("User-agent: *");
    expect(content).toContain("Allow: /");
    expect(content).toContain("Disallow: /admin");
    expect(content).toContain("Sitemap: https://example.com/sitemap.xml");
  });
});

describe("validateRobotsConfig", () => {
  it("flags conflicting allow and disallow rules", () => {
    const result = validateRobotsConfig(
      {
        userAgent: "*",
        allowRules: "/admin",
        disallowRules: "/admin",
        host: null,
        sitemapUrls: ["https://example.com/sitemap.xml"],
        customDirectives: null,
        isActive: true,
      },
      "https://example.com",
    );

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.severity === "error")).toBe(true);
  });
});

describe("publicUrls", () => {
  it("normalizes site URLs and builds entity paths", () => {
    expect(normalizeSiteUrl("https://example.com/")).toBe("https://example.com");
    expect(buildPublicEntityUrl("https://example.com/", "brand", "uk", "acme")).toBe(
      "https://example.com/uk/brands/acme",
    );
    expect(
      buildPublicEntityUrl("https://example.com", "page", "uk", "home", { isHomepage: true }),
    ).toBe("https://example.com/uk");
  });
});
