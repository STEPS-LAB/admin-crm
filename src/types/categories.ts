import type { CategoryStatus } from "@/constants/categories";

export interface CategoryTranslationInput {
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
}

export interface CategoryFlatItem {
  readonly id: string;
  readonly parentId: string | null;
  readonly sortOrder: number;
  readonly status: CategoryStatus;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly productCount: number;
  readonly childrenCount: number;
  readonly seoScore: number | null;
  readonly coverThumbnailUrl: string | null;
  readonly coverAlt: string | null;
  readonly updatedAt: Date;
}

export interface CategoryTreeNode extends CategoryFlatItem {
  readonly children: CategoryTreeNode[];
}

export interface CategoryDetail {
  readonly id: string;
  readonly parentId: string | null;
  readonly sortOrder: number;
  readonly status: CategoryStatus;
  readonly imageId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly translations: {
    readonly uk: CategoryTranslationInput;
    readonly en: CategoryTranslationInput;
  };
  readonly parentName: string | null;
  readonly productCount: number;
  readonly childrenCount: number;
}

export interface CategoryFormInput {
  readonly parentId: string | null;
  readonly sortOrder: number;
  readonly status: CategoryStatus;
  readonly translations: {
    readonly uk: CategoryTranslationInput;
    readonly en: CategoryTranslationInput;
  };
}

export interface CategoryParentOption {
  readonly id: string;
  readonly label: string;
  readonly depth: number;
}

export interface CategoryListFilters {
  readonly search?: string | undefined;
  readonly status?: CategoryStatus | undefined;
}
