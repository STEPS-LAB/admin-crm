import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { formatProductCount, getPublicSiteMessage } from "@/lib/public-site/messages";
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
    <section id="categories" className="bg-muted/20 scroll-mt-24 border-t py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8">
          <p className="text-primary text-sm font-medium">
            {getPublicSiteMessage(language, "categories.eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {getPublicSiteMessage(language, "categories.title")}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {getPublicSiteMessage(language, "categories.description")}
          </p>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              {getPublicSiteMessage(language, "categories.empty")}
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
                  prefetch={false}
                  className="block"
                >
                  <Card className="hover:bg-accent/20 h-full overflow-hidden transition-colors">
                    <div className="bg-muted relative aspect-[16/10]">
                      {category.coverThumbnailUrl ? (
                        <Image
                          src={category.coverThumbnailUrl}
                          alt={category.coverAlt ?? category.name}
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
                        <CardTitle className="text-base">{category.name}</CardTitle>
                        {category.seoScore !== null && scoreColors ? (
                          <Badge variant="outline" className={cn("shrink-0", scoreColors.text)}>
                            {getPublicSiteMessage(language, "common.seo")} {category.seoScore}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {formatProductCount(language, category.productCount)}
                      </p>
                    </CardHeader>
                    {category.description ? (
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3 text-sm">
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
