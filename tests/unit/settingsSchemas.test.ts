import { describe, expect, it } from "vitest";

import { collectChangedFields } from "@/lib/history/changeTracking";
import {
  generalSettingsSchema,
  localizationSettingsSchema,
} from "@/schemas/settings/settingsSchemas";

describe("generalSettingsSchema", () => {
  it("accepts valid general settings", () => {
    const result = generalSettingsSchema.safeParse({
      siteName: "SEO CMS",
      siteDescription: "Demo site",
      siteUrl: "https://example.com",
      logoUrl: "",
      faviconUrl: "",
    });

    expect(result.success).toBe(true);
  });
});

describe("localizationSettingsSchema", () => {
  it("accepts valid localization settings", () => {
    const result = localizationSettingsSchema.safeParse({
      defaultLanguage: "uk",
      supportedLanguages: ["uk", "en"],
      fallbackLanguage: "en",
      timezone: "Europe/Kyiv",
      currency: "UAH",
      automaticLocaleDetection: true,
      browserLanguageDetection: true,
      languageSwitcherEnabled: true,
      localizedUrlsEnabled: true,
      rtlSupportEnabled: false,
    });

    expect(result.success).toBe(true);
  });

  it("rejects fallback language outside supported list", () => {
    const result = localizationSettingsSchema.safeParse({
      defaultLanguage: "uk",
      supportedLanguages: ["uk"],
      fallbackLanguage: "en",
      timezone: "Europe/Kyiv",
      currency: "UAH",
      automaticLocaleDetection: false,
      browserLanguageDetection: true,
      languageSwitcherEnabled: true,
      localizedUrlsEnabled: true,
      rtlSupportEnabled: false,
    });

    expect(result.success).toBe(false);
  });
});

describe("collectChangedFields", () => {
  it("returns only modified keys", () => {
    const changed = collectChangedFields(
      { siteName: "Old", currency: "UAH" },
      { siteName: "New", currency: "UAH" },
    );

    expect(changed).toEqual(["siteName"]);
  });
});
