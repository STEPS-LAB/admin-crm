import type { RedirectStatusCode, SeoOwnerType } from "@/constants/seo";

export interface SeoEntityScore {
  readonly ownerType: SeoOwnerType;
  readonly label: string;
  readonly profileCount: number;
  readonly averageScore: number;
}

export interface SeoCenterOverview {
  readonly globalScore: number;
  readonly criticalIssues: number;
  readonly warnings: number;
  readonly recommendations: number;
  readonly profileCount: number;
  readonly redirectCount: number;
  readonly schemaCount: number;
  readonly lastScanAt: Date | null;
  readonly entityScores: SeoEntityScore[];
  readonly generatedAt: Date;
}

export interface SeoProfileListItem {
  readonly id: string;
  readonly ownerType: SeoOwnerType;
  readonly ownerId: string;
  readonly language: "uk" | "en";
  readonly entityLabel: string;
  readonly metaTitle: string | null;
  readonly overallScore: number | null;
  readonly isIndexable: boolean;
  readonly updatedAt: Date;
  readonly entityHref: string | null;
}

export interface SeoProfileDetail {
  readonly id: string;
  readonly ownerType: SeoOwnerType;
  readonly ownerId: string;
  readonly language: "uk" | "en";
  readonly entityLabel: string;
  readonly isIndexable: boolean;
  readonly metaTitle: string | null;
  readonly metaDescription: string | null;
  readonly index: boolean;
  readonly follow: boolean;
  readonly overallScore: number | null;
  readonly metadataScore: number | null;
  readonly schemaScore: number | null;
  readonly updatedAt: Date;
  readonly entityHref: string | null;
}

export interface SeoProfileListFilters {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string | undefined;
  readonly ownerType?: SeoOwnerType | undefined;
  readonly language?: "uk" | "en" | undefined;
}

export interface SeoMetadataInput {
  readonly metaTitle: string | null;
  readonly metaDescription: string | null;
  readonly index: boolean;
  readonly follow: boolean;
}

export interface EntitySeoProfiles {
  readonly uk: SeoProfileDetail;
  readonly en: SeoProfileDetail;
}

export interface RedirectListItem {
  readonly id: string;
  readonly source: string;
  readonly destination: string;
  readonly statusCode: RedirectStatusCode;
  readonly enabled: boolean;
  readonly hits: number;
  readonly lastHitAt: Date | null;
  readonly updatedAt: Date;
}

export interface RedirectDetail {
  readonly id: string;
  readonly source: string;
  readonly destination: string;
  readonly statusCode: RedirectStatusCode;
  readonly enabled: boolean;
  readonly hits: number;
  readonly lastHitAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface RedirectFormInput {
  readonly source: string;
  readonly destination: string;
  readonly statusCode: RedirectStatusCode;
  readonly enabled: boolean;
}

export interface RedirectListFilters {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string | undefined;
  readonly enabled?: boolean | undefined;
}
