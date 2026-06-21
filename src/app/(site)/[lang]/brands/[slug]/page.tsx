import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandDetailView } from "@/features/public-site/components/BrandDetailView";
import { PublicStructuredData } from "@/features/public-site/components/PublicStructuredData";
import {
  PublicSiteMaintenance,
  PublicSiteShell,
  loadPublicSitePageContext,
} from "@/features/public-site/components/PublicSiteShell";
import {
  getCachedPublicBrandSeo,
} from "@/lib/public-site/cachedPublicSeo";
import { getPublicBrandDetail } from "@/services/publicSiteService";
import {
  buildMaintenanceMetadata,
  buildNotFoundMetadata,
} from "@/services/publicSeoService";

export const dynamic = "force-dynamic";

interface PublicBrandPageProps {
  readonly params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicBrandPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return buildMaintenanceMetadata(
      pageState.context.language,
      pageState.context.settings.siteName,
    );
  }

  const seo = await getCachedPublicBrandSeo(pageState.context, slug);

  if (!seo) {
    return buildNotFoundMetadata(pageState.context.language);
  }

  return seo.metadata;
}

export default async function PublicBrandPage({
  params,
}: PublicBrandPageProps): Promise<React.JSX.Element> {
  const { lang, slug } = await params;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return <PublicSiteMaintenance context={pageState.context} />;
  }

  const [brand, seo] = await Promise.all([
    getPublicBrandDetail(pageState.context.language, slug),
    getCachedPublicBrandSeo(pageState.context, slug),
  ]);

  if (!brand) {
    notFound();
  }

  return (
    <>
      {seo ? <PublicStructuredData documents={seo.structuredData} /> : null}
      <PublicSiteShell context={pageState.context}>
        <BrandDetailView brand={brand} language={pageState.context.language} />
      </PublicSiteShell>
    </>
  );
}
