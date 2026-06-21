import { notFound } from "next/navigation";

import { getCategoryAction, getCategoryMediaAction, getCategoryParentOptionsAction } from "@/actions/categories";
import { PageHeader } from "@/components/navigation/PageHeader";
import { CategoryForm } from "@/features/categories/components/CategoryForm";
import { CategoryStatusBadge } from "@/features/categories/components/CategoryStatusBadge";
import { getOwnerSeoScore } from "@/services/publishWarningsService";

import type { CategoryFormValues } from "@/schemas/categories/categorySchemas";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{ title: string }> {
  const { id } = await params;
  const category = await getCategoryAction(id);

  return {
    title: category?.translations.uk.name ?? "Edit category",
  };
}

interface EditCategoryPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const [category, parentOptions, media, seoScore] = await Promise.all([
    getCategoryAction(id),
    getCategoryParentOptionsAction(id),
    getCategoryMediaAction(id),
    getOwnerSeoScore("category", id),
  ]);

  if (!category || !media) {
    notFound();
  }

  const defaultValues: CategoryFormValues = {
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    status: category.status,
    translations: category.translations,
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title={category.translations.uk.name}
        description={
          category.parentName
            ? `Child of ${category.parentName} · ${category.productCount} products`
            : `${category.productCount} products · ${category.childrenCount} children`
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: category.translations.uk.name },
        ]}
        actions={<CategoryStatusBadge status={category.status} />}
      />

      <div className="mt-8">
        <CategoryForm
          mode="edit"
          categoryId={category.id}
          defaultValues={defaultValues}
          parentOptions={parentOptions}
          media={media}
          seoScore={seoScore}
        />
      </div>
    </div>
  );
}
