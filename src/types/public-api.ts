import type { ApiScope } from "@/constants/api";
import type { SeoOwnerType } from "@/constants/seo";
import type { SitemapEntityType, SitemapTypeStats } from "@/types/sitemap-robots";
import type {
  PublicSiteCategoryCard,
  PublicSiteLanguage,
  PublicSiteProductCard,
} from "@/types/public-site";

export interface PublicApiPaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface PublicApiListMeta extends PublicApiPaginationMeta {
  readonly language: PublicSiteLanguage;
}

export interface PublicApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: PublicApiListMeta | PublicApiPaginationMeta | Record<string, unknown>;
}

export interface PublicApiErrorBody {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

export interface ApiKeyAuthContext {
  readonly id: string;
  readonly name: string;
  readonly scopes: readonly ApiScope[];
}

export interface PublicApiSettingsPayload {
  readonly siteName: string;
  readonly siteDescription: string | null;
  readonly siteUrl: string;
  readonly defaultLanguage: PublicSiteLanguage;
  readonly supportedLanguages: readonly PublicSiteLanguage[];
  readonly timezone: string;
  readonly currency: string;
  readonly localizedUrlsEnabled: boolean;
}

export interface PublicApiHealthPayload {
  readonly status: "ok";
  readonly version: string;
  readonly timestamp: string;
}

export interface PublicApiSearchPageResult {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string | null;
}

export interface PublicApiSearchBrandResult {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

export interface PublicApiSearchPayload {
  readonly query: string;
  readonly products: PublicSiteProductCard[];
  readonly categories: PublicSiteCategoryCard[];
  readonly pages: PublicApiSearchPageResult[];
  readonly brands: PublicApiSearchBrandResult[];
}

export interface PublicApiSitemapEntry {
  readonly ownerType: SitemapEntityType;
  readonly ownerId: string;
  readonly language: "uk" | "en";
  readonly loc: string;
  readonly slug: string;
  readonly label: string;
  readonly lastmod: string;
  readonly changefreq: string;
  readonly priority: string;
  readonly indexed: boolean;
  readonly excluded: boolean;
}

export interface PublicApiSitemapPayload {
  readonly enabled: boolean;
  readonly autoGenerate: boolean;
  readonly siteUrl: string;
  readonly sitemapUrl: string;
  readonly totalUrls: number;
  readonly indexedUrls: number;
  readonly excludedUrls: number;
  readonly hiddenUrls: number;
  readonly typeStats: SitemapTypeStats[];
  readonly entries: PublicApiSitemapEntry[];
  readonly generatedAt: string;
}

export interface PublicApiSeoProfileItem {
  readonly id: string;
  readonly ownerType: Extract<SeoOwnerType, "product" | "category" | "page" | "brand">;
  readonly ownerId: string;
  readonly language: PublicSiteLanguage;
  readonly entityLabel: string;
  readonly metaTitle: string | null;
  readonly metaDescription: string | null;
  readonly overallScore: number | null;
  readonly isIndexable: boolean;
  readonly updatedAt: string;
}

export interface PublicApiMediaPayload {
  readonly id: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly extension: string;
  readonly fileSize: number;
  readonly width: number | null;
  readonly height: number | null;
  readonly altUk: string | null;
  readonly altEn: string | null;
  readonly titleUk: string | null;
  readonly titleEn: string | null;
  readonly captionUk: string | null;
  readonly captionEn: string | null;
  readonly copyright: string | null;
  readonly photographer: string | null;
  readonly license: string | null;
  readonly publicUrl: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
