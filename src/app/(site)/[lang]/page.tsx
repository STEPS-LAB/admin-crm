import type { Metadata } from "next";

import { PublicStructuredData } from "@/features/public-site/components/PublicStructuredData";
import { SiteAboutSection } from "@/features/public-site/components/SiteAboutSection";
import { SiteCategoriesSection } from "@/features/public-site/components/SiteCategoriesSection";
import { SiteContactSection } from "@/features/public-site/components/SiteContactSection";
import { SiteHero } from "@/features/public-site/components/SiteHero";
import { SiteProductsSection } from "@/features/public-site/components/SiteProductsSection";
import { SiteSeoSection } from "@/features/public-site/components/SiteSeoSection";
import {
  PublicSiteMaintenance,
  PublicSiteShell,
  loadPublicSitePageContext,
} from "@/features/public-site/components/PublicSiteShell";
import { getCachedPublicSitePageData } from "@/lib/public-site/cachedPublicPageData";
import { getCachedPublicHomepageSeo } from "@/lib/public-site/cachedPublicSeo";
import { buildMaintenanceMetadata } from "@/services/publicSeoService";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface PublicSiteHomePageProps {
  readonly params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PublicSiteHomePageProps): Promise<Metadata> {
  const { lang } = await params;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return buildMaintenanceMetadata(
      pageState.context.language,
      pageState.context.settings.siteName,
    );
  }

  const seo = await getCachedPublicHomepageSeo(pageState.context);
  return seo.metadata;
}

export default async function PublicSiteHomePage({
  params,
}: PublicSiteHomePageProps): Promise<React.JSX.Element> {
  const { lang } = await params;
  const pageState = await loadPublicSitePageContext(lang);

  if (pageState.maintenance) {
    return <PublicSiteMaintenance context={pageState.context} />;
  }

  const [data, seo] = await Promise.all([
    getCachedPublicSitePageData(pageState.context.language),
    getCachedPublicHomepageSeo(pageState.context),
  ]);

  return (
    <>
      <PublicStructuredData documents={seo.structuredData} />
      <PublicSiteShell context={pageState.context} generatedAt={data.generatedAt}>
        <SiteHero
          siteName={data.settings.siteName}
          siteDescription={data.settings.siteDescription}
          homepage={data.homepage}
          publishedProducts={data.catalogStats.publishedProducts}
          publishedCategories={data.catalogStats.publishedCategories}
          language={data.language}
        />
        <SiteProductsSection products={data.products} language={data.language} />
        <SiteCategoriesSection categories={data.categories} language={data.language} />
        <SiteSeoSection
          overview={data.seoOverview}
          catalogStats={data.catalogStats}
          language={data.language}
        />
        <SiteAboutSection
          siteName={data.settings.siteName}
          siteDescription={data.settings.siteDescription}
          homepage={data.homepage}
          language={data.language}
        />
        <SiteContactSection
          siteName={data.settings.siteName}
          siteUrl={data.settings.siteUrl}
          timezone={data.settings.timezone}
          currency={data.settings.currency}
          language={data.language}
        />
      </PublicSiteShell>
    </>
  );
}
