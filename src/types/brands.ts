import type { BrandStatus } from "@/constants/brands";

export interface BrandTranslationInput {
  readonly name: string;
  readonly description: string | null;
}

export interface BrandListItem {
  readonly id: string;
  readonly slug: string;
  readonly status: BrandStatus;
  readonly country: string | null;
  readonly website: string | null;
  readonly logoUrl: string | null;
  readonly name: string;
  readonly productCount: number;
  readonly seoScore: number | null;
  readonly updatedAt: Date;
}

export interface BrandDetail {
  readonly id: string;
  readonly slug: string;
  readonly logoUrl: string | null;
  readonly website: string | null;
  readonly country: string | null;
  readonly status: BrandStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly translations: {
    readonly uk: BrandTranslationInput;
    readonly en: BrandTranslationInput;
  };
  readonly productCount: number;
}

export interface BrandFormInput {
  readonly slug: string;
  readonly logoUrl: string | null;
  readonly website: string | null;
  readonly country: string | null;
  readonly status: BrandStatus;
  readonly translations: {
    readonly uk: BrandTranslationInput;
    readonly en: BrandTranslationInput;
  };
}

export interface BrandListFilters {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string | undefined;
  readonly status?: BrandStatus | undefined;
  readonly hasProducts?: boolean | undefined;
}
