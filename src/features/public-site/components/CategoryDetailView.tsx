import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteBreadcrumbs } from "@/features/public-site/components/SiteBreadcrumbs";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { buildCategoryBreadcrumbTrail } from "@/lib/public-site/breadcrumbTrails";
import { formatPublicPrice } from "@/lib/public-site/formatPrice";
import { formatProductCount, getPublicSiteMessage } from "@/lib/public-site/messages";
import { buildPublicSiteEntityHref } from "@/lib/public-site/paths";
import { cn } from "@/lib/utils/cn";

import type {
  PublicSiteCategoryDetail,
  PublicSiteLanguage,
  PublicSiteProductCard,
} from "@/types/public-site";

export interface CategoryDetailViewProps {
  readonly category: PublicSiteCategoryDetail;
  readonly products: PublicSiteProductCard[];
  readonly language: PublicSiteLanguage;
}

export function CategoryDetailView({
  category,
  products,
  language,
}: CategoryDetailViewProps): React.JSX.Element {
  const scoreColors = category.seoScore !== null ? getSeoScoreColor(category.seoScore) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <SiteBreadcrumbs
        language={language}
        items={buildCategoryBreadcrumbTrail(category, language)}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-xl border">
            {category.coverThumbnailUrl ? (
              <Image
                src={category.coverThumbnailUrl}
                alt={category.coverAlt ?? category.name}
                fill
                className="object-cover"
                sizes="320px"
              />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                {getPublicSiteMessage(language, "common.noCoverImage")}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {category.seoScore !== null && scoreColors ? (
              <Badge variant="outline" className={cn(scoreColors.text)}>
                {getPublicSiteMessage(language, "common.seo")} {category.seoScore}
              </Badge>
            ) : null}
            <Badge variant="secondary">{formatProductCount(language, category.productCount)}</Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{category.name}</h1>
            {category.description ? (
              <p className="text-muted-foreground mt-4 text-lg">{category.description}</p>
            ) : null}
          </div>

          {products.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-10 text-center text-sm">
                {getPublicSiteMessage(language, "category.noProducts")}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={buildPublicSiteEntityHref("products", product.slug, language)}
                  className="block"
                >
                  <Card className="hover:bg-accent/30 h-full transition-colors">
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-2 text-sm">
                      <p className="text-foreground font-medium">
                        {formatPublicPrice(product.price, product.currency)}
                      </p>
                      {product.shortDescription ? (
                        <p className="line-clamp-2">{product.shortDescription}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
