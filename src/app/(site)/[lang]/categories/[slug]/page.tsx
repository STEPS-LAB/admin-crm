import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryDetailView } from "@/features/public-site/components/CategoryDetailView";
import { PublicStructuredData } from "@/features/public-site/components/PublicStructuredData";
import {
  PublicSiteMaintenance,
  PublicSiteShell,
  loadPublicSitePageContext,
} from "@/features/public-site/components/PublicSiteShell";
import {
  getCachedPublicCategorySeo,
} from "@/lib/public-site/cachedPublicSeo";
import { getPublicCategoryDetail, getPublicCategoryProducts } from "@/services/publicSiteService";
import {
  buildMaintenanceMetadata,
  buildNotFoundMetadata,
} from "@/services/publicSeoService";

export const dynamic = "force-dynamic";

interface PublicCategoryPageProps {
  readonly params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicCategoryPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return buildMaintenanceMetadata(
      pageState.context.language,
      pageState.context.settings.siteName,
    );
  }

  const seo = await getCachedPublicCategorySeo(pageState.context, slug);

  if (!seo) {
    return buildNotFoundMetadata(pageState.context.language);
  }

  return seo.metadata;
}

export default async function PublicCategoryPage({
  params,
}: PublicCategoryPageProps): Promise<React.JSX.Element> {
  const { lang, slug } = await params;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return <PublicSiteMaintenance context={pageState.context} />;
  }

  const [category, seo] = await Promise.all([
    getPublicCategoryDetail(pageState.context.language, slug),
    getCachedPublicCategorySeo(pageState.context, slug),
  ]);

  if (!category) {
    notFound();
  }

  const products = await getPublicCategoryProducts(pageState.context.language, category.id, 12);

  return (
    <>
      {seo ? <PublicStructuredData documents={seo.structuredData} /> : null}
      <PublicSiteShell context={pageState.context}>
        <CategoryDetailView
          category={category}
          products={products}
          language={pageState.context.language}
        />
      </PublicSiteShell>
    </>
  );
}
