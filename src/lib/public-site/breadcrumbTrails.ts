import {
  buildPublicSiteEntityHref,
  buildPublicSiteHomeHref,
  buildPublicSiteSectionHref,
} from "@/lib/public-site/paths";
import { getPublicSiteMessage } from "@/lib/public-site/messages";

import type {
  PublicSiteBrandDetail,
  PublicSiteCategoryDetail,
  PublicSiteLanguage,
  PublicSitePageDetail,
  PublicSiteProductDetail,
} from "@/types/public-site";

export interface PublicBreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}

export function buildProductBreadcrumbTrail(
  product: PublicSiteProductDetail,
  language: PublicSiteLanguage,
): PublicBreadcrumbItem[] {
  const items: PublicBreadcrumbItem[] = [
    {
      label: getPublicSiteMessage(language, "nav.products"),
      href: buildPublicSiteSectionHref(language, "products"),
    },
  ];

  if (product.categorySlug && product.categoryName) {
    items.push({
      label: product.categoryName,
      href: buildPublicSiteEntityHref("categories", product.categorySlug, language),
    });
  }

  items.push({ label: product.name });

  return items;
}

export function buildCategoryBreadcrumbTrail(
  category: PublicSiteCategoryDetail,
  language: PublicSiteLanguage,
): PublicBreadcrumbItem[] {
  return [
    {
      label: getPublicSiteMessage(language, "nav.categories"),
      href: buildPublicSiteSectionHref(language, "categories"),
    },
    { label: category.name },
  ];
}

export function buildBrandBreadcrumbTrail(
  brand: PublicSiteBrandDetail,
  language: PublicSiteLanguage,
): PublicBreadcrumbItem[] {
  return [
    {
      label: getPublicSiteMessage(language, "nav.brands"),
      href: buildPublicSiteHomeHref(language),
    },
    { label: brand.name },
  ];
}

export function buildContentPageBreadcrumbTrail(
  page: PublicSitePageDetail,
  language: PublicSiteLanguage,
): PublicBreadcrumbItem[] {
  return [
    {
      label: getPublicSiteMessage(language, "nav.pages"),
      href: buildPublicSiteHomeHref(language),
    },
    { label: page.title },
  ];
}

export function buildSearchBreadcrumbTrail(language: PublicSiteLanguage): PublicBreadcrumbItem[] {
  return [{ label: getPublicSiteMessage(language, "search.title") }];
}
