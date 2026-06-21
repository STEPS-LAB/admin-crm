import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SiteBreadcrumbs } from "@/features/public-site/components/SiteBreadcrumbs";
import { RichTextContent } from "@/features/public-site/components/RichTextContent";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { buildBrandBreadcrumbTrail } from "@/lib/public-site/breadcrumbTrails";
import { buildPublicSiteHomeHref } from "@/lib/public-site/paths";
import { cn } from "@/lib/utils/cn";

import type { PublicSiteBrandDetail, PublicSiteLanguage } from "@/types/public-site";

export interface BrandDetailViewProps {
  readonly brand: PublicSiteBrandDetail;
  readonly language: PublicSiteLanguage;
}

export function BrandDetailView({ brand, language }: BrandDetailViewProps): React.JSX.Element {
  const scoreColors =
    brand.seo?.overallScore !== null && brand.seo?.overallScore !== undefined
      ? getSeoScoreColor(brand.seo.overallScore)
      : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <SiteBreadcrumbs language={language} items={buildBrandBreadcrumbTrail(brand, language)} />

      <div className="mt-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-start">
          <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-xl border bg-muted">
            {brand.coverThumbnailUrl ? (
              <Image
                src={brand.coverThumbnailUrl}
                alt={brand.coverAlt ?? brand.name}
                fill
                className="object-cover"
                sizes="200px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No logo
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {brand.seo?.overallScore !== null &&
              brand.seo?.overallScore !== undefined &&
              scoreColors ? (
                <Badge variant="outline" className={cn(scoreColors.text)}>
                  SEO {brand.seo.overallScore}
                </Badge>
              ) : null}
              {brand.country ? <Badge variant="secondary">{brand.country}</Badge> : null}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">{brand.name}</h1>
            {brand.website ? (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                {brand.website}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        {brand.description ? (
          <Card>
            <CardContent className="pt-6">
              <RichTextContent html={brand.description} />
            </CardContent>
          </Card>
        ) : null}

        <div className="text-sm">
          <Link href={buildPublicSiteHomeHref(language)} className="text-primary hover:underline">
            Back to storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
