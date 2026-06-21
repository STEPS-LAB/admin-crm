import { describe, expect, it } from "vitest";

import { getPublicSiteMessage } from "@/lib/public-site/messages";
import { parsePublicSiteSearchQuery } from "@/schemas/public-site/searchSchemas";

describe("getPublicSiteMessage", () => {
  it("returns localized breadcrumb labels", () => {
    expect(getPublicSiteMessage("uk", "nav.products")).toBe("Товари");
    expect(getPublicSiteMessage("en", "nav.products")).toBe("Products");
  });

  it("interpolates variables", () => {
    expect(getPublicSiteMessage("en", "search.resultsFor", { query: "phone" })).toBe(
      "Results for “phone”",
    );
  });
});

describe("parsePublicSiteSearchQuery", () => {
  it("accepts valid queries", () => {
    expect(parsePublicSiteSearchQuery(" phone ")).toEqual({ q: "phone" });
  });

  it("rejects empty or invalid queries", () => {
    expect(parsePublicSiteSearchQuery("")).toBeNull();
    expect(parsePublicSiteSearchQuery("   ")).toBeNull();
  });
});
