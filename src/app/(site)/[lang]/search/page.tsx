import type { Metadata } from "next";

import { PublicStructuredData } from "@/features/public-site/components/PublicStructuredData";
import { SearchResultsView } from "@/features/public-site/components/SearchResultsView";
import {
  PublicSiteMaintenance,
  PublicSiteShell,
  loadPublicSitePageContext,
} from "@/features/public-site/components/PublicSiteShell";
import { getCachedPublicSearchSeo } from "@/lib/public-site/cachedPublicSeo";
import { parsePublicSiteSearchQuery } from "@/schemas/public-site/searchSchemas";
import { buildMaintenanceMetadata } from "@/services/publicSeoService";
import { searchPublicSiteCatalog } from "@/services/publicSiteService";

export const dynamic = "force-dynamic";

interface PublicSearchPageProps {
  readonly params: Promise<{ lang: string }>;
  readonly searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PublicSearchPageProps): Promise<Metadata> {
  const { lang } = await params;
  const { q } = await searchParams;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return buildMaintenanceMetadata(
      pageState.context.language,
      pageState.context.settings.siteName,
    );
  }

  const parsedQuery = parsePublicSiteSearchQuery(q);
  const seo = await getCachedPublicSearchSeo(pageState.context, parsedQuery?.q ?? null);
  return seo.metadata;
}

export default async function PublicSearchPage({
  params,
  searchParams,
}: PublicSearchPageProps): Promise<React.JSX.Element> {
  const { lang } = await params;
  const { q } = await searchParams;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return <PublicSiteMaintenance context={pageState.context} />;
  }

  const parsedQuery = parsePublicSiteSearchQuery(q);
  const [results, seo] = await Promise.all([
    parsedQuery
      ? searchPublicSiteCatalog(pageState.context.language, parsedQuery.q)
      : Promise.resolve(null),
    getCachedPublicSearchSeo(pageState.context, parsedQuery?.q ?? null),
  ]);

  return (
    <>
      <PublicStructuredData documents={seo.structuredData} />
      <PublicSiteShell context={pageState.context}>
        <SearchResultsView
          language={pageState.context.language}
          query={parsedQuery?.q ?? null}
          results={results}
        />
      </PublicSiteShell>
    </>
  );
}
