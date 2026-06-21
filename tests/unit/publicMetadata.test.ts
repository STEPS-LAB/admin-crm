import { describe, expect, it } from "vitest";

import { buildPublicPageSeo } from "@/lib/seo/publicMetadata";
import { buildProductBreadcrumbTrail } from "@/lib/public-site/breadcrumbTrails";

import type { SettingsRecord } from "@/types/settings";

function buildSettings(overrides: Partial<SettingsRecord> = {}): SettingsRecord {
  return {
    id: "settings-id",
    siteName: "SEO CMS",
    siteDescription: "Demo storefront",
    siteUrl: "https://example.com",
    defaultLanguage: "uk",
    supportedLanguages: ["uk", "en"],
    fallbackLanguage: "en",
    automaticLocaleDetection: true,
    browserLanguageDetection: true,
    languageSwitcherEnabled: true,
    localizedUrlsEnabled: true,
    rtlSupportEnabled: false,
    securityLevel: "standard",
    sessionIdleTimeoutHours: 8,
    sessionAbsoluteLifetimeHours: 24,
    loginLockoutEnabled: true,
    loginMaxAttempts: 5,
    loginLockoutWindowMinutes: 15,
    rateLimitSettingsPerMinute: 20,
    rateLimitUploadPerMinute: 30,
    rateLimitApiPerMinute: 100,
    rateLimitSearchPerMinute: 60,
    rateLimitImportPerMinute: 10,
    rateLimitExportPerMinute: 10,
    webhookMaxRetries: 5,
    webhookRetryBaseDelaySeconds: 60,
    auditLogLoginEnabled: true,
    auditLogFailedLoginEnabled: true,
    auditLogSettingsChangeEnabled: true,
    auditLogMediaUploadEnabled: true,
    auditLogSeoChangeEnabled: true,
    ipAllowList: [],
    ipBlockList: [],
    timezone: "Europe/Kyiv",
    currency: "UAH",
    logoUrl: null,
    faviconUrl: null,
    defaultMetaTitle: null,
    defaultMetaDescription: "Default description",
    defaultOgImage: "https://example.com/og.jpg",
    defaultTwitterCard: "summary_large_image",
    defaultIndexing: true,
    defaultFollow: true,
    defaultRobots: "index, follow",
    sitemapEnabled: true,
    sitemapAutoGenerate: true,
    sitemapUpdateFrequency: "daily",
    sitemapIncludeImages: true,
    sitemapIncludeVideos: false,
    robotsEnabled: true,
    robotsContent: null,
    theme: "system",
    primaryColor: null,
    borderRadius: 8,
    layoutDensity: "comfortable",
    headScripts: null,
    bodyScripts: null,
    footerScripts: null,
    allowCustomScripts: false,
    googleAnalyticsId: null,
    googleTagManagerId: null,
    googleSearchConsoleVerification: null,
    bingWebmasterVerification: null,
    facebookPixelId: null,
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    seoAutomationEnabled: true,
    autoGenerateSchemas: true,
    autoGenerateMetadata: true,
    developerModeEnabled: false,
    showSqlQueries: false,
    showApiTiming: false,
    showServerActions: false,
    mockDataEnabled: false,
    testModeEnabled: false,
    developerToolbarEnabled: false,
    verboseLoggingEnabled: false,
    backupScheduleEnabled: false,
    backupScheduleHourUtc: 3,
    backupRetentionMaxCount: 30,
    backupEncryptionEnabled: true,
    storageProvider: "supabase",
    maxUploadSizeMb: 25,
    imageCompressionEnabled: true,
    imageCompressionQuality: 80,
    autoWebpConversion: true,
    duplicateDetectionEnabled: true,
    smtpHost: null,
    smtpPort: 587,
    smtpUsername: null,
    smtpPasswordEncrypted: null,
    smtpEncryption: "tls",
    emailSenderName: null,
    emailSenderAddress: null,
    emailReplyTo: null,
    cacheDurationSeconds: 3600,
    cacheAutoCleanup: true,
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("buildPublicPageSeo", () => {
  it("builds canonical, hreflang, open graph, and structured data", () => {
    const result = buildPublicPageSeo({
      settings: buildSettings(),
      language: "uk",
      supportedLanguages: ["uk", "en"],
      content: {
        title: "Demo Product",
        description: "Short description",
        imageUrl: "https://example.com/product.jpg",
        ownerType: "product",
        ownerId: "product-id",
        slug: "demo-product",
      },
      seoRecord: {
        metaTitle: "SEO Product Title",
        metaDescription: "SEO description",
        canonicalUrl: null,
        autoGenerateCanonical: true,
        forceHttps: true,
        removeTrailingSlash: false,
        lowercaseCanonical: true,
        robotsIndex: true,
        robotsFollow: true,
        ogTitle: "OG Product",
        ogDescription: "OG description",
        ogImage: null,
        ogType: "product",
        ogLocale: null,
        ogSiteName: null,
        twitterCardType: "summary_large_image",
        twitterTitle: null,
        twitterDescription: null,
        twitterImage: null,
        manualHreflang: [],
        structuredData: [{ "@type": "Product", name: "Custom schema" }],
      },
      hreflangAlternates: [
        {
          language: "uk",
          href: "https://example.com/uk/products/demo-product",
          hreflang: "uk-UA",
          isDefault: true,
        },
        {
          language: "en",
          href: "https://example.com/en/products/demo-product",
          hreflang: "en",
          isDefault: false,
        },
      ],
    });

    expect(result.metadata.title).toBe("SEO Product Title");
    expect(result.metadata.alternates?.canonical).toBe(
      "https://example.com/uk/products/demo-product",
    );
    expect(result.metadata.alternates?.languages).toMatchObject({
      "uk-UA": "https://example.com/uk/products/demo-product",
      en: "https://example.com/en/products/demo-product",
      "x-default": "https://example.com/uk/products/demo-product",
    });
    expect(result.metadata.openGraph?.title).toBe("OG Product");
    expect(result.structuredData.length).toBeGreaterThan(1);
    expect(result.structuredData.some((document) => document["@type"] === "BreadcrumbList")).toBe(
      false,
    );
  });

  it("includes breadcrumb structured data when breadcrumbs are provided", () => {
    const result = buildPublicPageSeo({
      settings: buildSettings(),
      language: "uk",
      supportedLanguages: ["uk", "en"],
      content: {
        title: "Demo Product",
        description: "Short description",
        imageUrl: null,
        ownerType: "product",
        ownerId: "product-id",
        slug: "demo-product",
      },
      seoRecord: null,
      hreflangAlternates: [],
      breadcrumbs: buildProductBreadcrumbTrail(
        {
          id: "product-id",
          name: "Demo Product",
          slug: "demo-product",
          shortDescription: "Short",
          price: "100",
          currency: "UAH",
          categoryName: "Phones",
          brandName: null,
          seoScore: null,
          coverThumbnailUrl: null,
          coverAlt: null,
          description: null,
          oldPrice: null,
          stockStatus: "in_stock",
          sku: "SKU-1",
          categorySlug: "phones",
          brandSlug: null,
          seo: null,
        },
        "uk",
      ),
    });

    expect(result.structuredData.some((document) => document["@type"] === "BreadcrumbList")).toBe(
      true,
    );
  });

  it("respects manual canonical override", () => {
    const result = buildPublicPageSeo({
      settings: buildSettings(),
      language: "en",
      supportedLanguages: ["uk", "en"],
      content: {
        title: "Page",
        description: null,
        imageUrl: null,
        ownerType: "page",
        ownerId: "page-id",
        slug: "about",
      },
      seoRecord: {
        metaTitle: null,
        metaDescription: null,
        canonicalUrl: "https://example.com/custom-canonical",
        autoGenerateCanonical: false,
        forceHttps: true,
        removeTrailingSlash: false,
        lowercaseCanonical: true,
        robotsIndex: false,
        robotsFollow: true,
        ogTitle: null,
        ogDescription: null,
        ogImage: null,
        ogType: null,
        ogLocale: null,
        ogSiteName: null,
        twitterCardType: null,
        twitterTitle: null,
        twitterDescription: null,
        twitterImage: null,
        manualHreflang: [],
        structuredData: [],
      },
      hreflangAlternates: [],
    });

    expect(result.metadata.alternates?.canonical).toBe("https://example.com/custom-canonical");
    expect(result.metadata.robots).toMatchObject({ index: false, follow: true });
  });
});
