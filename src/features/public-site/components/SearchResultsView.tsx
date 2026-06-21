import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteBreadcrumbs } from "@/features/public-site/components/SiteBreadcrumbs";
import { SiteSearchForm } from "@/features/public-site/components/SiteSearchForm";
import { buildSearchBreadcrumbTrail } from "@/lib/public-site/breadcrumbTrails";
import { getPublicSiteMessage } from "@/lib/public-site/messages";
import { buildPublicSiteEntityHref } from "@/lib/public-site/paths";

import type { PublicSiteLanguage, PublicSiteSearchResults } from "@/types/public-site";

export interface SearchResultsViewProps {
  readonly language: PublicSiteLanguage;
  readonly query: string | null;
  readonly results: PublicSiteSearchResults | null;
}

function SearchResultSection({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}): React.JSX.Element | null {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function SearchResultsView({
  language,
  query,
  results,
}: SearchResultsViewProps): React.JSX.Element {
  const heading =
    query && query.length > 0
      ? getPublicSiteMessage(language, "search.resultsFor", { query })
      : getPublicSiteMessage(language, "search.title");

  const totalResults =
    results === null
      ? 0
      : results.products.length +
        results.categories.length +
        results.pages.length +
        results.brands.length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <SiteBreadcrumbs language={language} items={buildSearchBreadcrumbTrail(language)} />

      <div className="mt-8 space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
          <SiteSearchForm language={language} initialQuery={query ?? ""} className="max-w-xl" />
        </div>

        {!query ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {getPublicSiteMessage(language, "search.emptyQuery")}
            </CardContent>
          </Card>
        ) : null}

        {query && results && totalResults === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {getPublicSiteMessage(language, "search.noResults")}
            </CardContent>
          </Card>
        ) : null}

        {query && results && results.products.length > 0 ? (
          <SearchResultSection title={getPublicSiteMessage(language, "search.section.products")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.products.map((product) => (
                <Link
                  key={product.id}
                  href={buildPublicSiteEntityHref("products", product.slug, language)}
                  className="block"
                >
                  <Card className="h-full transition-colors hover:bg-accent/20">
                    <CardHeader>
                      <CardTitle className="text-base">{product.name}</CardTitle>
                    </CardHeader>
                    {product.shortDescription ? (
                      <CardContent className="text-sm text-muted-foreground">
                        {product.shortDescription}
                      </CardContent>
                    ) : null}
                  </Card>
                </Link>
              ))}
            </div>
          </SearchResultSection>
        ) : null}

        {query && results && results.categories.length > 0 ? (
          <SearchResultSection title={getPublicSiteMessage(language, "search.section.categories")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.categories.map((category) => (
                <Link
                  key={category.id}
                  href={buildPublicSiteEntityHref("categories", category.slug, language)}
                  className="block"
                >
                  <Card className="h-full transition-colors hover:bg-accent/20">
                    <CardHeader>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                    </CardHeader>
                    {category.description ? (
                      <CardContent className="text-sm text-muted-foreground">
                        {category.description}
                      </CardContent>
                    ) : null}
                  </Card>
                </Link>
              ))}
            </div>
          </SearchResultSection>
        ) : null}

        {query && results && results.pages.length > 0 ? (
          <SearchResultSection title={getPublicSiteMessage(language, "search.section.pages")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.pages.map((page) => (
                <Link
                  key={page.id}
                  href={buildPublicSiteEntityHref("pages", page.slug, language)}
                  className="block"
                >
                  <Card className="h-full transition-colors hover:bg-accent/20">
                    <CardHeader>
                      <CardTitle className="text-base">{page.title}</CardTitle>
                    </CardHeader>
                    {page.excerpt ? (
                      <CardContent className="text-sm text-muted-foreground">{page.excerpt}</CardContent>
                    ) : null}
                  </Card>
                </Link>
              ))}
            </div>
          </SearchResultSection>
        ) : null}

        {query && results && results.brands.length > 0 ? (
          <SearchResultSection title={getPublicSiteMessage(language, "search.section.brands")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={buildPublicSiteEntityHref("brands", brand.slug, language)}
                  className="block"
                >
                  <Card className="h-full transition-colors hover:bg-accent/20">
                    <CardHeader>
                      <CardTitle className="text-base">{brand.name}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </SearchResultSection>
        ) : null}
      </div>
    </main>
  );
}
