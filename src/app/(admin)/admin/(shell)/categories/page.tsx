import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { listCategoriesAction } from "@/actions/categories";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { CategoryListFilters } from "@/features/categories/components/CategoryListFilters";
import { CategoryTreeView } from "@/features/categories/components/CategoryTreeView";

import type { CategoryTreeNode } from "@/types/categories";

export const metadata = {
  title: "Categories",
};

function countTreeNodes(nodes: CategoryTreeNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countTreeNodes(node.children), 0);
}

interface CategoriesPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const tree = await listCategoriesAction(params);
  const total = countTreeNodes(tree);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Categories"
        description={`${total} categor${total === 1 ? "y" : "ies"} in taxonomy`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Categories" }]}
        actions={
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              New category
            </Link>
          </Button>
        }
      />

      <div className="mt-8 space-y-6">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <CategoryListFilters />
        </Suspense>

        {tree.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Create your first category to organize the product catalog."
          />
        ) : (
          <CategoryTreeView nodes={tree} />
        )}

        {tree.length === 0 ? (
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/admin/categories/new">Create first category</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
