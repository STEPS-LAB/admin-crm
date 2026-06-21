import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { formatPublicPrice } from "@/lib/public-site/formatPrice";
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
            <p className="text-sm font-medium text-primary">Catalog</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Featured products</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Published products from the administration panel, including pricing, media, and SEO scores.
            </p>
          </div>
          <Badge variant="outline">{products.length} shown</Badge>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No published products yet. Publish products in the admin to populate this section.
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
                  <Card className="h-full overflow-hidden transition-colors hover:bg-accent/20">
                    <div className="relative aspect-[4/3] bg-muted">
                      {product.coverThumbnailUrl ? (
                        <Image
                          src={product.coverThumbnailUrl}
                          alt={product.coverAlt ?? product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          No cover image
                        </div>
                      )}
                    </div>
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
                        {product.seoScore !== null && scoreColors ? (
                          <Badge variant="outline" className={cn("shrink-0", scoreColors.text)}>
                            SEO {product.seoScore}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-lg font-semibold">
                        {formatPublicPrice(product.price, product.currency)}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      {product.shortDescription ? (
                        <p className="line-clamp-3">{product.shortDescription}</p>
                      ) : null}
                      <p>
                        {[product.categoryName, product.brandName].filter(Boolean).join(" · ") ||
                          "Uncategorized"}
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
