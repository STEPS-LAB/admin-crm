import type { ProductQualityFilter, ProductStatus, StockStatus } from "@/constants/products";
import type { ProductSortDirection, ProductSortField } from "@/constants/catalog";

export interface ProductTranslationInput {
  readonly name: string;
  readonly slug: string;
  readonly shortDescription: string | null;
  readonly description: string | null;
}

export interface ProductTranslationRecord extends ProductTranslationInput {
  readonly language: "uk" | "en";
}

export interface ProductListItem {
  readonly id: string;
  readonly sku: string;
  readonly status: ProductStatus;
  readonly price: string;
  readonly oldPrice: string | null;
  readonly currency: string;
  readonly stockStatus: StockStatus;
  readonly updatedAt: Date;
  readonly name: string;
  readonly slug: string;
  readonly categoryName: string | null;
  readonly brandName: string | null;
  readonly seoScore: number | null;
  readonly coverThumbnailUrl: string | null;
  readonly coverAlt: string | null;
}

export interface ProductDetail {
  readonly id: string;
  readonly sku: string;
  readonly barcode: string | null;
  readonly categoryId: string;
  readonly brandId: string | null;
  readonly status: ProductStatus;
  readonly price: string;
  readonly oldPrice: string | null;
  readonly currency: string;
  readonly stockQuantity: number;
  readonly stockStatus: StockStatus;
  readonly publishedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly translations: {
    readonly uk: ProductTranslationInput;
    readonly en: ProductTranslationInput;
  };
  readonly categoryName: string | null;
  readonly brandName: string | null;
}

export interface ProductFormLookupOption {
  readonly id: string;
  readonly label: string;
}

export interface ProductListFilters {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string | undefined;
  readonly status?: ProductStatus | undefined;
  readonly categoryId?: string | undefined;
  readonly brandId?: string | undefined;
  readonly stockStatus?: StockStatus | undefined;
  readonly qualityFilter?: ProductQualityFilter | undefined;
  readonly sortBy?: ProductSortField | undefined;
  readonly sortDir?: ProductSortDirection | undefined;
}

export interface ProductFormInput {
  readonly sku: string;
  readonly barcode: string | null;
  readonly categoryId: string;
  readonly brandId: string | null;
  readonly status: ProductStatus;
  readonly price: string;
  readonly oldPrice: string | null;
  readonly currency: string;
  readonly stockQuantity: number;
  readonly stockStatus: StockStatus;
  readonly translations: {
    readonly uk: ProductTranslationInput;
    readonly en: ProductTranslationInput;
  };
}
