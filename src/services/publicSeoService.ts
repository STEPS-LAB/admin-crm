import {
  findAutomaticHreflangAlternates,
  findEntitySeoRecord,
  findPublishedHomepagePageId,
} from "@/repositories/publicSeoRepository";
import {
  findPublishedBrandBySlug,
  findPublishedCategoryBySlug,
  findPublishedHomepageContent,
  findPublishedPageBySlug,
  findPublishedProductBySlug,
} from "@/repositories/publicSiteRepository";
import {
  buildBrandBreadcrumbTrail,
  buildCategoryBreadcrumbTrail,
  buildContentPageBreadcrumbTrail,
  buildProductBreadcrumbTrail,
  buildSearchBreadcrumbTrail,
} from "@/lib/public-site/breadcrumbTrails";
import { getPublicSiteMessage } from "@/lib/public-site/messages";
import { buildPublicSiteSearchHref } from "@/lib/public-site/paths";
import {
  buildMaintenanceMetadata,
  buildNotFoundMetadata,
  buildPublicPageSeo,
  buildPublicUtilityPageSeo,
} from "@/lib/seo/publicMetadata";

import type { PublicPageSeoResult } from "@/types/public-seo";
import type { PublicSiteContext } from "@/types/public-site";

export async function getPublicHomepageSeo(
  context: PublicSiteContext,
): Promise<PublicPageSeoResult> {
  const homepage = await findPublishedHomepageContent(context.language);
  const pageId = await findPublishedHomepagePageId(context.language);

  if (!pageId) {
    return buildPublicPageSeo({
      settings: context.settings,
      language: context.language,
      supportedLanguages: context.supportedLanguages,
      content: {
        title: context.settings.siteName,
        description: context.settings.siteDescription,
        imageUrl: context.settings.defaultOgImage,
        ownerType: "page",
        ownerId: "homepage",
        slug: context.language,
        isHomepage: true,
      },
      seoRecord: null,
      hreflangAlternates: [],
    });
  }

  const [seoRecord, hreflangAlternates] = await Promise.all([
    findEntitySeoRecord("page", pageId, context.language),
    findAutomaticHreflangAlternates("page", pageId, context.settings, context.supportedLanguages),
  ]);

  return buildPublicPageSeo({
    settings: context.settings,
    language: context.language,
    supportedLanguages: context.supportedLanguages,
    content: {
      title: homepage?.title ?? context.settings.siteName,
      description:
        homepage?.excerpt ?? context.settings.siteDescription ?? context.settings.defaultMetaDescription,
      imageUrl: context.settings.defaultOgImage,
      ownerType: "page",
      ownerId: pageId,
      slug: homepage?.slug ?? context.language,
      isHomepage: true,
    },
    seoRecord,
    hreflangAlternates,
  });
}

export async function getPublicProductSeo(
  context: PublicSiteContext,
  slug: string,
): Promise<PublicPageSeoResult | null> {
  const product = await findPublishedProductBySlug(context.language, slug);

  if (!product) {
    return null;
  }

  const [seoRecord, hreflangAlternates] = await Promise.all([
    findEntitySeoRecord("product", product.id, context.language),
    findAutomaticHreflangAlternates("product", product.id, context.settings, context.supportedLanguages),
  ]);

  return buildPublicPageSeo({
    settings: context.settings,
    language: context.language,
    supportedLanguages: context.supportedLanguages,
    content: {
      title: product.name,
      description: product.shortDescription ?? product.seo?.metaDescription ?? null,
      imageUrl: product.coverThumbnailUrl,
      ownerType: "product",
      ownerId: product.id,
      slug: product.slug,
    },
    seoRecord,
    hreflangAlternates,
    breadcrumbs: buildProductBreadcrumbTrail(product, context.language),
  });
}

export async function getPublicCategorySeo(
  context: PublicSiteContext,
  slug: string,
): Promise<PublicPageSeoResult | null> {
  const category = await findPublishedCategoryBySlug(context.language, slug);

  if (!category) {
    return null;
  }

  const [seoRecord, hreflangAlternates] = await Promise.all([
    findEntitySeoRecord("category", category.id, context.language),
    findAutomaticHreflangAlternates("category", category.id, context.settings, context.supportedLanguages),
  ]);

  return buildPublicPageSeo({
    settings: context.settings,
    language: context.language,
    supportedLanguages: context.supportedLanguages,
    content: {
      title: category.name,
      description: category.description ?? category.seo?.metaDescription ?? null,
      imageUrl: category.coverThumbnailUrl,
      ownerType: "category",
      ownerId: category.id,
      slug: category.slug,
    },
    seoRecord,
    hreflangAlternates,
    breadcrumbs: buildCategoryBreadcrumbTrail(category, context.language),
  });
}

export async function getPublicContentPageSeo(
  context: PublicSiteContext,
  slug: string,
): Promise<PublicPageSeoResult | null> {
  const page = await findPublishedPageBySlug(context.language, slug);

  if (!page) {
    return null;
  }

  const [seoRecord, hreflangAlternates] = await Promise.all([
    findEntitySeoRecord("page", page.id, context.language),
    findAutomaticHreflangAlternates("page", page.id, context.settings, context.supportedLanguages),
  ]);

  return buildPublicPageSeo({
    settings: context.settings,
    language: context.language,
    supportedLanguages: context.supportedLanguages,
    content: {
      title: page.title,
      description: page.excerpt ?? page.seo?.metaDescription ?? null,
      imageUrl: context.settings.defaultOgImage,
      ownerType: "page",
      ownerId: page.id,
      slug: page.slug,
    },
    seoRecord,
    hreflangAlternates,
    breadcrumbs: buildContentPageBreadcrumbTrail(page, context.language),
  });
}

export async function getPublicBrandSeo(
  context: PublicSiteContext,
  slug: string,
): Promise<PublicPageSeoResult | null> {
  const brand = await findPublishedBrandBySlug(context.language, slug);

  if (!brand) {
    return null;
  }

  const [seoRecord, hreflangAlternates] = await Promise.all([
    findEntitySeoRecord("brand", brand.id, context.language),
    findAutomaticHreflangAlternates("brand", brand.id, context.settings, context.supportedLanguages),
  ]);

  return buildPublicPageSeo({
    settings: context.settings,
    language: context.language,
    supportedLanguages: context.supportedLanguages,
    content: {
      title: brand.name,
      description: brand.description ?? brand.seo?.metaDescription ?? null,
      imageUrl: brand.coverThumbnailUrl,
      ownerType: "brand",
      ownerId: brand.id,
      slug: brand.slug,
    },
    seoRecord,
    hreflangAlternates,
    breadcrumbs: buildBrandBreadcrumbTrail(brand, context.language),
  });
}

export function getPublicSearchSeo(
  context: PublicSiteContext,
  query: string | null,
): PublicPageSeoResult {
  const title =
    query && query.length > 0
      ? getPublicSiteMessage(context.language, "search.resultsFor", { query })
      : getPublicSiteMessage(context.language, "search.title");

  const pathname = query
    ? buildPublicSiteSearchHref(context.language, query)
    : buildPublicSiteSearchHref(context.language);

  return buildPublicUtilityPageSeo({
    settings: context.settings,
    language: context.language,
    supportedLanguages: context.supportedLanguages,
    title,
    pathname,
    ...(query && query.length > 0 ? { query } : {}),
    ...(context.settings.siteDescription
      ? { description: context.settings.siteDescription }
      : {}),
    breadcrumbs: buildSearchBreadcrumbTrail(context.language),
  });
}

export { buildMaintenanceMetadata, buildNotFoundMetadata };
