import { listAllInternalLinksAction } from "@/actions/seo";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { InternalLinkListTable } from "@/features/seo/components/InternalLinkListTable";

export const metadata = {
  title: "Internal Links",
};

export default async function InternalLinksPage(): Promise<React.JSX.Element> {
  const items = await listAllInternalLinksAction();

  return (
    <>
      <PageHeader
        title="Internal links"
        description={`${items.length} manual internal link${items.length === 1 ? "" : "s"} across SEO profiles`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SEO Center", href: "/admin/seo" },
          { label: "Internal Links" },
        ]}
      />

      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            title="No manual internal links yet"
            description="Add curated links from individual SEO profiles to strengthen internal linking."
          />
        ) : (
          <InternalLinkListTable items={items} />
        )}
      </div>
    </>
  );
}
