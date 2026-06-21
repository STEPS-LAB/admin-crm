import {
  PUBLIC_SITE_CATEGORY_LIMIT,
  PUBLIC_SITE_PRODUCT_LIMIT,
  PUBLIC_SITE_SEARCH_LIMIT,
} from "@/constants/public-site";
import {
  searchPublishedBrands,
  searchPublishedCategories,
  searchPublishedPages,
  searchPublishedProducts,
} from "@/repositories/publicApiRepository";
import {
  getSupportedPublicLanguages,
  resolvePublicSiteLanguageFromSettings,
} from "@/lib/public-site/language";
import {
  findPublicCatalogStats,
  findPublishedBrandBySlug,
  findPublishedCategoryBySlug,
  findPublishedCategoryCards,
  findPublishedHomepageContent,
  findPublishedPageBySlug,
  findPublishedProductBySlug,
  findPublishedProductCards,
  findPublishedProductsForCategory,
} from "@/repositories/publicSiteRepository";
import { getOverview } from "@/services/seoCenterService";
import { getSettings } from "@/services/settingsService";

import type {
  PublicSiteBrandDetail,
  PublicSiteCategoryDetail,
  PublicSiteContext,
  PublicSiteLanguage,
  PublicSitePageData,
  PublicSitePageDetail,
  PublicSiteProductCard,
  PublicSiteProductDetail,
  PublicSiteSearchResults,
} from "@/types/public-site";

export { resolvePublicSiteLanguage } from "@/lib/public-site/language";

export async function loadPublicSiteContext(
  langParam: string | undefined,
): Promise<PublicSiteContext> {
  const settings = await getSettings();

  return {
    settings,
    language: resolvePublicSiteLanguageFromSettings(langParam, settings),
    supportedLanguages: getSupportedPublicLanguages(settings),
    languageSwitcherEnabled: settings.languageSwitcherEnabled,
    rtlSupportEnabled: settings.rtlSupportEnabled,
  };
}

export async function getPublicSitePageData(language: PublicSiteLanguage): Promise<PublicSitePageData> {
  const [settings, homepage, products, categories, seoOverview, catalogStats] = await Promise.all([
    getSettings(),
    findPublishedHomepageContent(language),
    findPublishedProductCards(language, PUBLIC_SITE_PRODUCT_LIMIT),
    findPublishedCategoryCards(language, PUBLIC_SITE_CATEGORY_LIMIT),
    getOverview(),
    findPublicCatalogStats(),
  ]);

  return {
    language,
    settings,
    homepage,
    products,
    categories,
    seoOverview,
    catalogStats,
    generatedAt: new Date(),
  };
}

export async function getPublicProductDetail(
  language: PublicSiteLanguage,
  slug: string,
): Promise<PublicSiteProductDetail | null> {
  return findPublishedProductBySlug(language, slug);
}

export async function getPublicCategoryDetail(
  language: PublicSiteLanguage,
  slug: string,
): Promise<PublicSiteCategoryDetail | null> {
  return findPublishedCategoryBySlug(language, slug);
}

export async function getPublicCategoryProducts(
  language: PublicSiteLanguage,
  categoryId: string,
  limit: number,
): Promise<PublicSiteProductCard[]> {
  return findPublishedProductsForCategory(language, categoryId, limit);
}

export async function getPublicPageDetail(
  language: PublicSiteLanguage,
  slug: string,
): Promise<PublicSitePageDetail | null> {
  return findPublishedPageBySlug(language, slug);
}

export async function getPublicBrandDetail(
  language: PublicSiteLanguage,
  slug: string,
): Promise<PublicSiteBrandDetail | null> {
  return findPublishedBrandBySlug(language, slug);
}

export async function searchPublicSiteCatalog(
  language: PublicSiteLanguage,
  query: string,
): Promise<PublicSiteSearchResults> {
  const limit = PUBLIC_SITE_SEARCH_LIMIT;
  const [products, categories, pages, brands] = await Promise.all([
    searchPublishedProducts(language, query, limit),
    searchPublishedCategories(language, query, limit),
    searchPublishedPages(language, query, limit),
    searchPublishedBrands(language, query, limit),
  ]);

  return {
    query,
    products,
    categories,
    pages,
    brands,
  };
}
