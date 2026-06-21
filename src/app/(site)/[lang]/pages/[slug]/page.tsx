import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageDetailView } from "@/features/public-site/components/PageDetailView";
import { PublicStructuredData } from "@/features/public-site/components/PublicStructuredData";
import {
  PublicSiteMaintenance,
  PublicSiteShell,
  loadPublicSitePageContext,
} from "@/features/public-site/components/PublicSiteShell";
import {
  getCachedPublicContentPageSeo,
} from "@/lib/public-site/cachedPublicSeo";
import { getPublicPageDetail } from "@/services/publicSiteService";
import {
  buildMaintenanceMetadata,
  buildNotFoundMetadata,
} from "@/services/publicSeoService";

export const dynamic = "force-dynamic";

interface PublicContentPageProps {
  readonly params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicContentPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return buildMaintenanceMetadata(
      pageState.context.language,
      pageState.context.settings.siteName,
    );
  }

  const seo = await getCachedPublicContentPageSeo(pageState.context, slug);

  if (!seo) {
    return buildNotFoundMetadata(pageState.context.language);
  }

  return seo.metadata;
}

export default async function PublicContentPage({
  params,
}: PublicContentPageProps): Promise<React.JSX.Element> {
  const { lang, slug } = await params;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return <PublicSiteMaintenance context={pageState.context} />;
  }

  const [page, seo] = await Promise.all([
    getPublicPageDetail(pageState.context.language, slug),
    getCachedPublicContentPageSeo(pageState.context, slug),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <>
      {seo ? <PublicStructuredData documents={seo.structuredData} /> : null}
      <PublicSiteShell context={pageState.context}>
        <PageDetailView page={page} language={pageState.context.language} />
      </PublicSiteShell>
    </>
  );
}
