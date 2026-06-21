import { describe, expect, it } from "vitest";

import {
  extractLanguageFromPathname,
  isPublicSiteLanguageSegment,
  replaceLanguageInPathname,
  resolveLegacySiteLanguage,
} from "@/lib/public-site/pathLanguage";
import {
  buildPublicSiteEntityHref,
  buildPublicSiteHomeHref,
  buildPublicSiteSearchHref,
  buildPublicSiteSectionHref,
} from "@/lib/public-site/paths";

describe("public site paths", () => {
  it("builds canonical entity href", () => {
    expect(buildPublicSiteEntityHref("products", "demo-product", "uk")).toBe(
      "/uk/products/demo-product",
    );
  });

  it("builds search href with encoded query", () => {
    expect(buildPublicSiteSearchHref("en", "demo product")).toBe("/en/search?q=demo%20product");
    expect(buildPublicSiteSearchHref("uk")).toBe("/uk/search");
  });

  it("builds canonical home href", () => {
    expect(buildPublicSiteHomeHref("en")).toBe("/en");
  });

  it("builds section href on home page", () => {
    expect(buildPublicSiteSectionHref("uk", "products")).toBe("/uk#products");
  });
});

describe("public site path language", () => {
  it("detects supported language segments", () => {
    expect(isPublicSiteLanguageSegment("uk")).toBe(true);
    expect(isPublicSiteLanguageSegment("fr")).toBe(false);
  });

  it("replaces language in canonical paths", () => {
    expect(replaceLanguageInPathname("/uk/products/demo", "en")).toBe("/en/products/demo");
    expect(replaceLanguageInPathname("/uk", "en")).toBe("/en");
  });

  it("extracts language from pathname", () => {
    expect(extractLanguageFromPathname("/uk/products/demo")).toBe("uk");
    expect(extractLanguageFromPathname("/admin")).toBeNull();
  });

  it("resolves legacy language query fallback", () => {
    expect(resolveLegacySiteLanguage("en", "uk")).toBe("en");
    expect(resolveLegacySiteLanguage(undefined, "uk")).toBe("uk");
  });
});
