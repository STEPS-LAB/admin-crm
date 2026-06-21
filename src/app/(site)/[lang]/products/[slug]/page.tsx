import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/features/public-site/components/ProductDetailView";
import { PublicStructuredData } from "@/features/public-site/components/PublicStructuredData";
import {
  PublicSiteMaintenance,
  PublicSiteShell,
  loadPublicSitePageContext,
} from "@/features/public-site/components/PublicSiteShell";
import {
  getCachedPublicProductSeo,
} from "@/lib/public-site/cachedPublicSeo";
import { getPublicProductDetail } from "@/services/publicSiteService";
import {
  buildMaintenanceMetadata,
  buildNotFoundMetadata,
} from "@/services/publicSeoService";

export const dynamic = "force-dynamic";

interface PublicProductPageProps {
  readonly params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicProductPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return buildMaintenanceMetadata(
      pageState.context.language,
      pageState.context.settings.siteName,
    );
  }

  const seo = await getCachedPublicProductSeo(pageState.context, slug);

  if (!seo) {
    return buildNotFoundMetadata(pageState.context.language);
  }

  return seo.metadata;
}

export default async function PublicProductPage({
  params,
}: PublicProductPageProps): Promise<React.JSX.Element> {
  const { lang, slug } = await params;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return <PublicSiteMaintenance context={pageState.context} />;
  }

  const [product, seo] = await Promise.all([
    getPublicProductDetail(pageState.context.language, slug),
    getCachedPublicProductSeo(pageState.context, slug),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <>
      {seo ? <PublicStructuredData documents={seo.structuredData} /> : null}
      <PublicSiteShell context={pageState.context}>
        <ProductDetailView product={product} language={pageState.context.language} />
      </PublicSiteShell>
    </>
  );
}
