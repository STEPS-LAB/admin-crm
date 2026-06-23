import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { STOCK_STATUSES } from "@/constants/products";
import { SiteBreadcrumbs } from "@/features/public-site/components/SiteBreadcrumbs";
import { RichTextContent } from "@/features/public-site/components/RichTextContent";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { buildProductBreadcrumbTrail } from "@/lib/public-site/breadcrumbTrails";
import { formatPublicPrice } from "@/lib/public-site/formatPrice";
import { getPublicSiteMessage, getPublicStockStatusLabel } from "@/lib/public-site/messages";
import { buildPublicSiteEntityHref } from "@/lib/public-site/paths";
import { cn } from "@/lib/utils/cn";

import type { PublicSiteLanguage, PublicSiteProductDetail } from "@/types/public-site";
import type { StockStatus } from "@/constants/products";

export interface ProductDetailViewProps {
  readonly product: PublicSiteProductDetail;
  readonly language: PublicSiteLanguage;
}

export function ProductDetailView({
  product,
  language,
}: ProductDetailViewProps): React.JSX.Element {
  const scoreColors = product.seoScore !== null ? getSeoScoreColor(product.seoScore) : null;
  const stockLabel = STOCK_STATUSES.includes(product.stockStatus as StockStatus)
    ? getPublicStockStatusLabel(language, product.stockStatus as StockStatus)
    : product.stockStatus;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <SiteBreadcrumbs language={language} items={buildProductBreadcrumbTrail(product, language)} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="bg-muted relative aspect-square overflow-hidden rounded-xl border">
          {product.coverThumbnailUrl ? (
            <Image
              src={product.coverThumbnailUrl}
              alt={product.coverAlt ?? product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              {getPublicSiteMessage(language, "common.noCoverImage")}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {product.seoScore !== null && scoreColors ? (
                <Badge variant="outline" className={cn(scoreColors.text)}>
                  {getPublicSiteMessage(language, "common.seo")} {product.seoScore}
                </Badge>
              ) : null}
              <Badge variant="secondary">{stockLabel}</Badge>
              <Badge variant="outline">
                {getPublicSiteMessage(language, "common.sku")} {product.sku}
              </Badge>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>
            {product.shortDescription ? (
              <p className="text-muted-foreground text-lg">{product.shortDescription}</p>
            ) : null}
          </div>

          <div className="flex items-end gap-3">
            <p className="text-3xl font-semibold">
              {formatPublicPrice(product.price, product.currency)}
            </p>
            {product.oldPrice ? (
              <p className="text-muted-foreground pb-1 text-lg line-through">
                {formatPublicPrice(product.oldPrice, product.currency)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            {product.categorySlug && product.categoryName ? (
              <Link
                href={buildPublicSiteEntityHref("categories", product.categorySlug, language)}
                className="hover:bg-accent rounded-md border px-3 py-1.5"
              >
                {product.categoryName}
              </Link>
            ) : null}
            {product.brandSlug && product.brandName ? (
              <Link
                href={buildPublicSiteEntityHref("brands", product.brandSlug, language)}
                className="hover:bg-accent rounded-md border px-3 py-1.5"
              >
                {product.brandName}
              </Link>
            ) : null}
          </div>

          {product.description ? (
            <Card>
              <CardContent className="pt-6">
                <RichTextContent html={product.description} />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </main>
  );
}
