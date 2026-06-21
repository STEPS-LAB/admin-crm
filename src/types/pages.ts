import type { PageStatus, PageType } from "@/constants/pages";

export interface PageTranslationInput {
  readonly title: string;
  readonly slug: string;
  readonly content: string | null;
  readonly excerpt: string | null;
}

export interface PageListItem {
  readonly id: string;
  readonly pageType: PageType;
  readonly status: PageStatus;
  readonly isHomepage: boolean;
  readonly sortOrder: number;
  readonly updatedAt: Date;
  readonly title: string;
  readonly slug: string;
  readonly seoScore: number | null;
}

export interface PageDetail {
  readonly id: string;
  readonly pageType: PageType;
  readonly status: PageStatus;
  readonly isHomepage: boolean;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly translations: {
    readonly uk: PageTranslationInput;
    readonly en: PageTranslationInput;
  };
}

export interface PageFormInput {
  readonly pageType: PageType;
  readonly status: PageStatus;
  readonly isHomepage: boolean;
  readonly sortOrder: number;
  readonly translations: {
    readonly uk: PageTranslationInput;
    readonly en: PageTranslationInput;
  };
}

export interface PageListFilters {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string | undefined;
  readonly status?: PageStatus | undefined;
  readonly pageType?: PageType | undefined;
}
