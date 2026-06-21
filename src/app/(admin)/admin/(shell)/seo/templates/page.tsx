import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { listSeoTemplatesAction } from "@/actions/seo";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { SeoTemplateListFilters } from "@/features/seo/components/SeoTemplateListFilters";
import { SeoTemplateListTable } from "@/features/seo/components/SeoTemplateListTable";

export const metadata = {
  title: "SEO Templates",
};

interface SeoTemplatesPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SeoTemplatesPage({
  searchParams,
}: SeoTemplatesPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const items = await listSeoTemplatesAction(params);

  return (
    <>
      <PageHeader
        title="SEO Templates"
        description={`${items.length} template${items.length === 1 ? "" : "s"} for metadata generation`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SEO Center", href: "/admin/seo" },
          { label: "Templates" },
        ]}
        actions={
          <Button asChild>
            <Link href="/admin/seo/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              New template
            </Link>
          </Button>
        }
      />

      <div className="mt-8 space-y-6">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <SeoTemplateListFilters />
        </Suspense>

        {items.length === 0 ? (
          <EmptyState
            title="No templates yet"
            description="Create reusable metadata templates with variables for products, categories, pages, and brands."
          />
        ) : (
          <SeoTemplateListTable items={items} />
        )}
      </div>
    </>
  );
}
