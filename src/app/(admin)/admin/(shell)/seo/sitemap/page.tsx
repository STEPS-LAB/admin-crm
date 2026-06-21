import Link from "next/link";

import { getSitemapSummaryAction } from "@/actions/seo";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { SitemapManager } from "@/features/seo/components/SitemapManager";

export const metadata = {
  title: "XML Sitemap",
};

export default async function SeoSitemapPage(): Promise<React.JSX.Element> {
  const summary = await getSitemapSummaryAction();

  return (
    <>
      <PageHeader
        title="XML Sitemap"
        description="Manage discoverable URLs for products, categories, pages, and brands"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SEO Center", href: "/admin/seo" },
          { label: "Sitemap" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/settings/seo">Settings</Link>
          </Button>
        }
      />

      <div className="mt-8">
        <SitemapManager summary={summary} />
      </div>
    </>
  );
}
