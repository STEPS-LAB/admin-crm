import type { SeoOwnerType } from "@/constants/seo";

export type SitemapEntityType = Extract<SeoOwnerType, "product" | "category" | "page" | "brand">;

export interface SitemapEntry {
  readonly ownerType: SitemapEntityType;
  readonly ownerId: string;
  readonly language: "uk" | "en";
  readonly loc: string;
  readonly slug: string;
  readonly label: string;
  readonly lastmod: Date;
  readonly changefreq: string;
  readonly priority: string;
  readonly indexed: boolean;
  readonly excluded: boolean;
}

export interface SitemapTypeStats {
  readonly ownerType: SitemapEntityType;
  readonly label: string;
  readonly total: number;
  readonly indexed: number;
  readonly excluded: number;
}

export interface SitemapSummary {
  readonly enabled: boolean;
  readonly autoGenerate: boolean;
  readonly siteUrl: string;
  readonly sitemapUrl: string;
  readonly totalUrls: number;
  readonly indexedUrls: number;
  readonly excludedUrls: number;
  readonly hiddenUrls: number;
  readonly typeStats: SitemapTypeStats[];
  readonly entries: SitemapEntry[];
  readonly generatedAt: Date;
}

export interface SitemapGenerationResult {
  readonly xml: string;
  readonly summary: SitemapSummary;
}

export interface RobotsConfigInput {
  readonly userAgent: string;
  readonly allowRules: string | null;
  readonly disallowRules: string | null;
  readonly host: string | null;
  readonly sitemapUrls: string[];
  readonly customDirectives: string | null;
  readonly isActive: boolean;
}

export interface RobotsConfigDetail extends RobotsConfigInput {
  readonly id: string;
  readonly updatedAt: Date;
}

export interface RobotsValidationIssue {
  readonly field: string;
  readonly message: string;
  readonly severity: "error" | "warning";
}

export interface RobotsSummary {
  readonly enabled: boolean;
  readonly siteUrl: string;
  readonly content: string;
  readonly config: RobotsConfigDetail | null;
  readonly validation: {
    readonly valid: boolean;
    readonly issues: RobotsValidationIssue[];
  };
  readonly generatedAt: Date;
}
