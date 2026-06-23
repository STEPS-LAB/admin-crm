import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { formatPublicPrice } from "@/lib/public-site/formatPrice";
import { getPublicSiteMessage } from "@/lib/public-site/messages";
import { buildPublicSiteEntityHref } from "@/lib/public-site/paths";
import { cn } from "@/lib/utils/cn";

import type { PublicSiteLanguage, PublicSiteProductCard } from "@/types/public-site";

export interface SiteProductsSectionProps {
  readonly products: PublicSiteProductCard[];
  readonly language: PublicSiteLanguage;
}

export function SiteProductsSection({
  products,
  language,
}: SiteProductsSectionProps): React.JSX.Element {
  return (
    <section id="products" className="scroll-mt-24 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-primary text-sm font-medium">
              {getPublicSiteMessage(language, "products.eyebrow")}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              {getPublicSiteMessage(language, "products.title")}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {getPublicSiteMessage(language, "products.description")}
            </p>
          </div>
          <Badge variant="outline">
            {getPublicSiteMessage(language, "products.shown", {
              count: String(products.length),
            })}
          </Badge>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              {getPublicSiteMessage(language, "products.empty")}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => {
              const scoreColors =
                product.seoScore !== null ? getSeoScoreColor(product.seoScore) : null;

              return (
                <Link
                  key={product.id}
                  href={buildPublicSiteEntityHref("products", product.slug, language)}
                  className="block"
                >
                  <Card className="hover:bg-accent/20 h-full overflow-hidden transition-colors">
                    <div className="bg-muted relative aspect-[4/3]">
                      {product.coverThumbnailUrl ? (
                        <Image
                          src={product.coverThumbnailUrl}
                          alt={product.coverAlt ?? product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                          {getPublicSiteMessage(language, "common.noCoverImage")}
                        </div>
                      )}
                    </div>
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
                        {product.seoScore !== null && scoreColors ? (
                          <Badge variant="outline" className={cn("shrink-0", scoreColors.text)}>
                            {getPublicSiteMessage(language, "common.seo")} {product.seoScore}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-lg font-semibold">
                        {formatPublicPrice(product.price, product.currency)}
                      </p>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-2 text-sm">
                      {product.shortDescription ? (
                        <p className="line-clamp-3">{product.shortDescription}</p>
                      ) : null}
                      <p>
                        {[product.categoryName, product.brandName].filter(Boolean).join(" · ") ||
                          getPublicSiteMessage(language, "common.uncategorized")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
