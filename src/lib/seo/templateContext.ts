import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  brandTranslations,
  brands,
  categoryTranslations,
  categories,
  productTranslations,
  products,
} from "@/db/schema/catalog";
import { pageTranslations, pages } from "@/db/schema/pages";
import { seoProfiles } from "@/db/schema/seo";
import { findSettings } from "@/repositories/settingsRepository";

import type { SeoTemplateLanguage, SeoTemplateOwnerType } from "@/constants/seo-templates";
import type { SeoTemplateContext } from "@/lib/seo/templateEngine";

function buildSiteContext(settings: Awaited<ReturnType<typeof findSettings>>): SeoTemplateContext {
  return {
    site: {
      name: settings?.siteName ?? "SEO CMS",
      description: settings?.siteDescription ?? "",
      url: settings?.siteUrl ?? "",
    },
    year: String(new Date().getFullYear()),
  };
}

export function buildSampleSeoTemplateContext(
  ownerType: SeoTemplateOwnerType,
  language: SeoTemplateLanguage,
): SeoTemplateContext {
  const base: SeoTemplateContext = {
    site: {
      name: "SEO CMS Demo",
      description: "Premium SEO-first content management platform",
      url: "https://example.com",
    },
    year: String(new Date().getFullYear()),
    language,
    price: "1299.00",
    currency: "UAH",
    sku: "SKU-DEMO-001",
  };

  switch (ownerType) {
    case "product":
      return {
        ...base,
        product: {
          name: language === "uk" ? "Демо товар" : "Demo product",
          short_description:
            language === "uk" ? "Короткий опис демо товару" : "Short description for the demo product",
          description:
            language === "uk" ? "Повний опис демо товару" : "Full description for the demo product",
          slug: "demo-product",
        },
      };
    case "category":
      return {
        ...base,
        category: {
          name: language === "uk" ? "Демо категорія" : "Demo category",
          description: language === "uk" ? "Опис демо категорії" : "Demo category description",
          slug: "demo-category",
        },
      };
    case "page":
      return {
        ...base,
        page: {
          title: language === "uk" ? "Демо сторінка" : "Demo page",
          excerpt: language === "uk" ? "Уривок демо сторінки" : "Demo page excerpt",
          slug: "demo-page",
        },
      };
    case "brand":
      return {
        ...base,
        brand: {
          name: language === "uk" ? "Демо бренд" : "Demo brand",
          slug: "demo-brand",
        },
      };
    case "global":
      return base;
    default: {
      const exhaustive: never = ownerType;
      return exhaustive;
    }
  }
}

export async function buildSeoTemplateContextForProfile(
  profileId: string,
): Promise<SeoTemplateContext | null> {
  const db = getDb();
  const settings = await findSettings();

  const [profile] = await db
    .select({
      ownerType: seoProfiles.ownerType,
      ownerId: seoProfiles.ownerId,
      language: seoProfiles.language,
    })
    .from(seoProfiles)
    .where(and(eq(seoProfiles.id, profileId), isNull(seoProfiles.deletedAt)))
    .limit(1);

  if (!profile) {
    return null;
  }

  const context: SeoTemplateContext = {
    ...buildSiteContext(settings),
    language: profile.language,
  };

  switch (profile.ownerType) {
    case "product": {
      const [row] = await db
        .select({
          name: productTranslations.name,
          shortDescription: productTranslations.shortDescription,
          description: productTranslations.description,
          slug: productTranslations.slug,
          sku: products.sku,
          price: products.price,
          currency: products.currency,
        })
        .from(products)
        .innerJoin(
          productTranslations,
          and(
            eq(productTranslations.productId, products.id),
            eq(productTranslations.language, profile.language),
          ),
        )
        .where(and(eq(products.id, profile.ownerId), isNull(products.deletedAt)))
        .limit(1);

      if (row) {
        context.product = {
          name: row.name,
          short_description: row.shortDescription ?? "",
          description: row.description ?? "",
          slug: row.slug,
        };
        context.price = row.price;
        context.currency = row.currency;
        context.sku = row.sku;
      }
      break;
    }
    case "category": {
      const [row] = await db
        .select({
          name: categoryTranslations.name,
          description: categoryTranslations.description,
          slug: categoryTranslations.slug,
        })
        .from(categories)
        .innerJoin(
          categoryTranslations,
          and(
            eq(categoryTranslations.categoryId, categories.id),
            eq(categoryTranslations.language, profile.language),
          ),
        )
        .where(and(eq(categories.id, profile.ownerId), isNull(categories.deletedAt)))
        .limit(1);

      if (row) {
        context.category = {
          name: row.name,
          description: row.description ?? "",
          slug: row.slug,
        };
      }
      break;
    }
    case "page": {
      const [row] = await db
        .select({
          title: pageTranslations.title,
          excerpt: pageTranslations.excerpt,
          slug: pageTranslations.slug,
        })
        .from(pages)
        .innerJoin(
          pageTranslations,
          and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.language, profile.language)),
        )
        .where(and(eq(pages.id, profile.ownerId), isNull(pages.deletedAt)))
        .limit(1);

      if (row) {
        context.page = {
          title: row.title,
          excerpt: row.excerpt ?? "",
          slug: row.slug,
        };
      }
      break;
    }
    case "brand": {
      const [row] = await db
        .select({
          name: brandTranslations.name,
          slug: brands.slug,
        })
        .from(brands)
        .innerJoin(
          brandTranslations,
          and(eq(brandTranslations.brandId, brands.id), eq(brandTranslations.language, profile.language)),
        )
        .where(and(eq(brands.id, profile.ownerId), isNull(brands.deletedAt)))
        .limit(1);

      if (row) {
        context.brand = {
          name: row.name,
          slug: row.slug,
        };
      }
      break;
    }
    default:
      break;
  }

  return context;
}
