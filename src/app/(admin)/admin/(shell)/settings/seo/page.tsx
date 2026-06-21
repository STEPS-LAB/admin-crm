import { getSettingsAction } from "@/actions/settings";
import { PageHeader } from "@/components/navigation/PageHeader";
import { SeoSettingsForm } from "@/features/settings/components/SeoSettingsForm";

export const metadata = {
  title: "SEO Settings",
};

export default async function SeoSettingsPage(): Promise<React.JSX.Element> {
  const settings = await getSettingsAction();

  return (
    <>
      <PageHeader
        title="SEO"
        description="Default metadata, sitemap, and robots configuration"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "SEO" },
        ]}
      />

      <div className="mt-8 max-w-4xl">
        <SeoSettingsForm
          defaultValues={{
            defaultMetaTitle: settings.defaultMetaTitle,
            defaultMetaDescription: settings.defaultMetaDescription,
            defaultOgImage: settings.defaultOgImage,
            defaultTwitterCard: settings.defaultTwitterCard ?? "summary_large_image",
            defaultIndexing: settings.defaultIndexing,
            defaultFollow: settings.defaultFollow,
            defaultRobots: settings.defaultRobots,
            sitemapEnabled: settings.sitemapEnabled,
            sitemapAutoGenerate: settings.sitemapAutoGenerate,
            sitemapUpdateFrequency: settings.sitemapUpdateFrequency ?? "daily",
            sitemapIncludeImages: settings.sitemapIncludeImages,
            sitemapIncludeVideos: settings.sitemapIncludeVideos,
            robotsEnabled: settings.robotsEnabled,
            robotsContent: settings.robotsContent,
          }}
        />
      </div>
    </>
  );
}
