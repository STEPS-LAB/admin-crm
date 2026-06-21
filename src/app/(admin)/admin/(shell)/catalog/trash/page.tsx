import Link from "next/link";

import { listCatalogTrashAction } from "@/actions/catalog/trash";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { CatalogTrashPanel } from "@/features/catalog/components/CatalogTrashPanel";

export const metadata = {
  title: "Catalog Trash",
};

export default async function CatalogTrashPage(): Promise<React.JSX.Element> {
  const items = await listCatalogTrashAction();

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Catalog trash"
        description={`${items.length} deleted item${items.length === 1 ? "" : "s"} available for restore`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Catalog" },
          { label: "Trash" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/products">Back to products</Link>
          </Button>
        }
      />

      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            title="Trash is empty"
            description="Deleted products, categories, pages, and brands will appear here."
          />
        ) : (
          <CatalogTrashPanel items={items} />
        )}
      </div>
    </div>
  );
}
