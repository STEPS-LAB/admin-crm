import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { buildPublicSiteEntityHref } from "@/lib/public-site/paths";
import { cn } from "@/lib/utils/cn";

import type { PublicSiteCategoryCard, PublicSiteLanguage } from "@/types/public-site";

export interface SiteCategoriesSectionProps {
  readonly categories: PublicSiteCategoryCard[];
  readonly language: PublicSiteLanguage;
}

export function SiteCategoriesSection({
  categories,
  language,
}: SiteCategoriesSectionProps): React.JSX.Element {
  return (
    <section id="categories" className="scroll-mt-24 border-t bg-muted/20 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Navigation</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Shop by category</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Published categories with live product counts and SEO health indicators.
          </p>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No published categories yet. Publish categories in the admin to populate this section.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => {
              const scoreColors =
                category.seoScore !== null ? getSeoScoreColor(category.seoScore) : null;

              return (
                <Link
                  key={category.id}
                  href={buildPublicSiteEntityHref("categories", category.slug, language)}
                  className="block"
                >
                  <Card className="h-full overflow-hidden transition-colors hover:bg-accent/20">
                    <div className="relative aspect-[16/10] bg-muted">
                      {category.coverThumbnailUrl ? (
                        <Image
                          src={category.coverThumbnailUrl}
                          alt={category.coverAlt ?? category.name}
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
                        <CardTitle className="text-base">{category.name}</CardTitle>
                        {category.seoScore !== null && scoreColors ? (
                          <Badge variant="outline" className={cn("shrink-0", scoreColors.text)}>
                            SEO {category.seoScore}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category.productCount} product{category.productCount === 1 ? "" : "s"}
                      </p>
                    </CardHeader>
                    {category.description ? (
                      <CardContent>
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </CardContent>
                    ) : null}
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
