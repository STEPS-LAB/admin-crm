import { config } from "dotenv";
import { eq, isNull } from "drizzle-orm";

import { BUNDLED_PLUGINS } from "@/constants/plugins";
import { getDb } from "@/db/client";
import {
  brandTranslations,
  brands,
  canonical,
  categories,
  categoryTranslations,
  metadata,
  openGraph,
  productTranslations,
  products,
  robots,
  seoAnalysis,
  seoProfiles,
  seoScoreHistory,
  seoTemplates,
  settings,
  twitterCards,
  notifications,
  notificationSettings,
  pluginInstallations,
} from "@/db/schema";
import { logger } from "@/lib/logger";

config({ path: ".env.local" });
config();

const DEMO_ADMIN_ID = "00000000-0000-4000-8000-000000000001";
const DEMO_CATEGORY_ID = "00000000-0000-4000-8000-000000000010";
const DEMO_PRODUCT_ID = "00000000-0000-4000-8000-000000000020";
const DEMO_BRAND_ID = "00000000-0000-4000-8000-000000000030";
const DEMO_SETTINGS_ID = "00000000-0000-4000-8000-000000000040";

async function seedSettings(): Promise<void> {
  const db = getDb();

  const existing = await db.select().from(settings).limit(1);

  if (existing.length > 0) {
    logger.info("Settings already seeded, skipping");
    return;
  }

  await db.insert(settings).values({
    id: DEMO_SETTINGS_ID,
    siteName: "SEO CMS Demo",
    siteDescription: "Headless SEO Content Management System",
    siteUrl: "https://example.com",
    defaultMetaTitle: "{{site.name}} — {{page.title}}",
    defaultMetaDescription: "{{site.description}}",
    defaultRobots: "index, follow",
  });

  logger.info("Seeded default settings");
}

async function seedSeoTemplates(): Promise<void> {
  const db = getDb();

  const existing = await db.select().from(seoTemplates).limit(1);

  if (existing.length > 0) {
    logger.info("SEO templates already seeded, skipping");
    return;
  }

  await db.insert(seoTemplates).values([
    {
      ownerType: "product",
      language: "uk",
      name: "Default Product (UK)",
      metaTitleTemplate: "{{product.name}} — {{site.name}}",
      metaDescriptionTemplate: "{{product.short_description}}",
      isDefault: true,
    },
    {
      ownerType: "product",
      language: "en",
      name: "Default Product (EN)",
      metaTitleTemplate: "{{product.name}} — {{site.name}}",
      metaDescriptionTemplate: "{{product.short_description}}",
      isDefault: true,
    },
    {
      ownerType: "category",
      language: "uk",
      name: "Default Category (UK)",
      metaTitleTemplate: "{{category.name}} — {{site.name}}",
      metaDescriptionTemplate: "{{category.description}}",
      isDefault: true,
    },
    {
      ownerType: "global",
      language: "uk",
      name: "Global Default (UK)",
      metaTitleTemplate: "{{site.name}}",
      metaDescriptionTemplate: "{{site.description}}",
      isDefault: true,
    },
  ]);

  logger.info("Seeded SEO templates");
}

async function seedCatalog(): Promise<void> {
  const db = getDb();

  const existingBrand = await db
    .select()
    .from(brands)
    .where(eq(brands.id, DEMO_BRAND_ID))
    .limit(1);

  if (existingBrand.length === 0) {
    await db.insert(brands).values({
      id: DEMO_BRAND_ID,
      slug: "demo-brand",
      status: "published",
    });

    await db.insert(brandTranslations).values([
      {
        brandId: DEMO_BRAND_ID,
        language: "uk",
        name: "Демо Бренд",
        description: "Демонстраційний бренд для початкового наповнення",
      },
      {
        brandId: DEMO_BRAND_ID,
        language: "en",
        name: "Demo Brand",
        description: "Demonstration brand for initial seed data",
      },
    ]);
  }

  const existingCategory = await db
    .select()
    .from(categories)
    .where(eq(categories.id, DEMO_CATEGORY_ID))
    .limit(1);

  if (existingCategory.length === 0) {
    await db.insert(categories).values({
      id: DEMO_CATEGORY_ID,
      sortOrder: 0,
      status: "published",
    });

    await db.insert(categoryTranslations).values([
      {
        categoryId: DEMO_CATEGORY_ID,
        language: "uk",
        name: "Електроніка",
        slug: "elektronika",
        description: "Демонстраційна категорія верхнього рівня",
      },
      {
        categoryId: DEMO_CATEGORY_ID,
        language: "en",
        name: "Electronics",
        slug: "electronics",
        description: "Top-level demonstration category",
      },
    ]);
  }

  const existingProduct = await db
    .select()
    .from(products)
    .where(eq(products.id, DEMO_PRODUCT_ID))
    .limit(1);

  if (existingProduct.length === 0) {
    await db.insert(products).values({
      id: DEMO_PRODUCT_ID,
      sku: "DEMO-001",
      brandId: DEMO_BRAND_ID,
      categoryId: DEMO_CATEGORY_ID,
      status: "published",
      price: "1999.00",
      oldPrice: "2499.00",
      currency: "UAH",
      stockQuantity: 50,
      stockStatus: "in_stock",
      publishedAt: new Date(),
    });

    await db.insert(productTranslations).values([
      {
        productId: DEMO_PRODUCT_ID,
        language: "uk",
        name: "Демо Продукт",
        slug: "demo-produkt",
        shortDescription: "Демонстраційний продукт для тестування CMS",
        description: "<p>Повний опис демонстраційного продукту.</p>",
      },
      {
        productId: DEMO_PRODUCT_ID,
        language: "en",
        name: "Demo Product",
        slug: "demo-product",
        shortDescription: "Demonstration product for CMS testing",
        description: "<p>Full description of the demonstration product.</p>",
      },
    ]);

    for (const language of ["uk", "en"] as const) {
      const [profile] = await db
        .insert(seoProfiles)
        .values({
          ownerType: "product",
          ownerId: DEMO_PRODUCT_ID,
          language,
          isIndexable: true,
          priority: "0.8",
          changeFrequency: "weekly",
        })
        .returning({ id: seoProfiles.id });

      if (!profile) {
        continue;
      }

      await db.insert(metadata).values({
        seoProfileId: profile.id,
        metaTitle: language === "uk" ? "Демо Продукт — SEO CMS" : "Demo Product — SEO CMS",
        metaDescription:
          language === "uk"
            ? "Демонстраційний продукт з повним SEO профілем"
            : "Demonstration product with full SEO profile",
      });

      await db.insert(canonical).values({ seoProfileId: profile.id, autoGenerate: true });
      await db.insert(robots).values({ seoProfileId: profile.id });
      await db.insert(openGraph).values({
        seoProfileId: profile.id,
        ogTitle: language === "uk" ? "Демо Продукт" : "Demo Product",
        ogType: "product",
      });
      await db.insert(twitterCards).values({
        seoProfileId: profile.id,
        cardType: "summary_large_image",
        title: language === "uk" ? "Демо Продукт" : "Demo Product",
      });
    }
  }

  logger.info("Seeded catalog demo data");
}

async function seedAdminProfile(): Promise<void> {
  const db = getDb();
  const { profiles } = await import("@/db/schema");

  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, DEMO_ADMIN_ID))
    .limit(1);

  if (existing.length > 0) {
    logger.info("Admin profile already seeded, skipping");
    return;
  }

  try {
    await db.insert(profiles).values({
      id: DEMO_ADMIN_ID,
      email: "admin@example.com",
      displayName: "Administrator",
      locale: "uk",
      timezone: "Europe/Kyiv",
      isActive: true,
    });

    logger.info("Seeded admin profile bootstrap (requires matching auth.users row in Supabase)");
  } catch (error) {
    logger.warn("Admin profile seed skipped — auth.users FK may not exist yet", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function seedSeoAnalysis(): Promise<void> {
  const db = getDb();

  const profiles = await db
    .select({ id: seoProfiles.id })
    .from(seoProfiles)
    .leftJoin(seoAnalysis, eq(seoAnalysis.seoProfileId, seoProfiles.id))
    .where(isNull(seoAnalysis.id));

  if (profiles.length === 0) {
    logger.info("SEO analysis already seeded, skipping");
    return;
  }

  for (const [index, profile] of profiles.entries()) {
    const overallScore = 78 + (index % 3) * 2;

    await db.insert(seoAnalysis).values({
      seoProfileId: profile.id,
      overallScore,
      technicalScore: 84,
      metadataScore: 88,
      schemaScore: 72,
      contentScore: 76,
      imagesScore: 65,
      performanceScore: 81,
      accessibilityScore: 90,
      warnings: [
        { code: "MISSING_ALT", message: "One product image is missing ALT text", severity: "warning" },
      ],
      errors: [],
      recommendations: [
        { code: "ADD_FAQ_SCHEMA", message: "Consider adding FAQ structured data", severity: "info" },
      ],
      lastScanAt: new Date(),
    });

    for (const daysAgo of [6, 4, 2, 0]) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      await db.insert(seoScoreHistory).values({
        seoProfileId: profile.id,
        previousScore: overallScore - 4,
        newScore: overallScore - daysAgo,
        changedFields: ["metadataScore"],
        createdAt,
      });
    }
  }

  logger.info(`Seeded SEO analysis for ${profiles.length} profile(s)`);
}

async function seedNotifications(): Promise<void> {
  const db = getDb();

  const existing = await db.select().from(notifications).limit(1);

  if (existing.length > 0) {
    logger.info("Notifications already seeded, skipping");
    return;
  }

  await db.insert(notificationSettings).values({
    profileId: DEMO_ADMIN_ID,
  });

  await db.insert(notifications).values([
    {
      profileId: DEMO_ADMIN_ID,
      type: "seo",
      title: "SEO profiles ready",
      message: "SEO profiles were provisioned for seeded catalog entities.",
      link: "/admin/seo/profiles",
      metadata: { category: "seo", priority: "medium" },
      isRead: false,
    },
    {
      profileId: DEMO_ADMIN_ID,
      type: "success",
      title: "Catalog seed completed",
      message: "Demo products, categories, and brands are available in the admin.",
      link: "/admin/products",
      metadata: { category: "system", priority: "info" },
      isRead: false,
    },
    {
      profileId: null,
      type: "system",
      title: "Notifications Center enabled",
      message: "In-app notifications are now available for administrators.",
      link: "/admin/notifications",
      metadata: { category: "system", priority: "low" },
      isRead: true,
      readAt: new Date(),
    },
    {
      profileId: DEMO_ADMIN_ID,
      type: "warning",
      title: "Metadata coverage below target",
      message: "3 products are missing meta descriptions in the English locale.",
      link: "/admin/seo",
      metadata: { category: "seo", priority: "high" },
      isRead: false,
    },
  ]);

  logger.info("Seeded demo notifications");
}

async function seedPlugins(): Promise<void> {
  const db = getDb();

  const existing = await db.select().from(pluginInstallations).limit(1);

  if (existing.length > 0) {
    logger.info("Plugin installations already seeded, skipping");
    return;
  }

  const bundledPlugins = BUNDLED_PLUGINS.filter((plugin) => plugin.availability === "bundled");

  await db.insert(pluginInstallations).values(
    bundledPlugins.map((plugin) => ({
      slug: plugin.slug,
      enabled: plugin.defaultEnabled,
    })),
  );

  logger.info(`Seeded ${bundledPlugins.length} plugin installation(s)`);
}

async function main(): Promise<void> {
  logger.info("Starting database seed");

  await seedSettings();
  await seedSeoTemplates();
  await seedCatalog();
  await seedSeoAnalysis();
  await seedAdminProfile();
  await seedNotifications();
  await seedPlugins();

  logger.info("Database seed completed");
}

main().catch((error: unknown) => {
  logger.error("Database seed failed", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
