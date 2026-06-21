import type { SeoCenterOverview } from "@/types/seo-center";
import type { PublicApiSearchBrandResult, PublicApiSearchPageResult } from "@/types/public-api";
import type { SettingsRecord } from "@/types/settings";

export type PublicSiteLanguage = "uk" | "en";

export interface PublicSiteProductCard {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly shortDescription: string | null;
  readonly price: string;
  readonly currency: string;
  readonly categoryName: string | null;
  readonly brandName: string | null;
  readonly seoScore: number | null;
  readonly coverThumbnailUrl: string | null;
  readonly coverAlt: string | null;
}

export interface PublicSiteCategoryCard {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly productCount: number;
  readonly seoScore: number | null;
  readonly coverThumbnailUrl: string | null;
  readonly coverAlt: string | null;
}

export interface PublicSiteHomepageContent {
  readonly title: string;
  readonly excerpt: string | null;
  readonly content: string | null;
  readonly slug: string;
}

export interface PublicSiteSeoMetadata {
  readonly metaTitle: string | null;
  readonly metaDescription: string | null;
  readonly overallScore: number | null;
}

export interface PublicSiteProductDetail extends PublicSiteProductCard {
  readonly description: string | null;
  readonly oldPrice: string | null;
  readonly stockStatus: string;
  readonly sku: string;
  readonly categorySlug: string | null;
  readonly brandSlug: string | null;
  readonly seo: PublicSiteSeoMetadata | null;
}

export interface PublicSiteCategoryDetail extends PublicSiteCategoryCard {
  readonly seo: PublicSiteSeoMetadata | null;
}

export interface PublicSitePageDetail {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string | null;
  readonly content: string | null;
  readonly pageType: string;
  readonly seo: PublicSiteSeoMetadata | null;
}

export interface PublicSiteBrandDetail {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly website: string | null;
  readonly country: string | null;
  readonly seo: PublicSiteSeoMetadata | null;
  readonly coverThumbnailUrl: string | null;
  readonly coverAlt: string | null;
}

export interface PublicSiteContext {
  readonly language: PublicSiteLanguage;
  readonly settings: SettingsRecord;
  readonly supportedLanguages: PublicSiteLanguage[];
  readonly languageSwitcherEnabled: boolean;
  readonly rtlSupportEnabled: boolean;
}

export interface PublicSiteCatalogStats {
  readonly publishedProducts: number;
  readonly publishedCategories: number;
  readonly publishedPages: number;
  readonly publishedBrands: number;
}

export interface PublicSitePageData {
  readonly language: PublicSiteLanguage;
  readonly settings: SettingsRecord;
  readonly homepage: PublicSiteHomepageContent | null;
  readonly products: PublicSiteProductCard[];
  readonly categories: PublicSiteCategoryCard[];
  readonly seoOverview: SeoCenterOverview;
  readonly catalogStats: PublicSiteCatalogStats;
  readonly generatedAt: Date;
}

export interface PublicSiteSearchResults {
  readonly query: string;
  readonly products: readonly PublicSiteProductCard[];
  readonly categories: readonly PublicSiteCategoryCard[];
  readonly pages: readonly PublicApiSearchPageResult[];
  readonly brands: readonly PublicApiSearchBrandResult[];
}
