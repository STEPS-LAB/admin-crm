import { getCategoryParentOptionsAction } from "@/actions/categories";
import { PageHeader } from "@/components/navigation/PageHeader";
import { CategoryForm } from "@/features/categories/components/CategoryForm";

import type { CategoryFormValues } from "@/schemas/categories/categorySchemas";

export const metadata = {
  title: "New category",
};

const EMPTY_TRANSLATION = {
  name: "",
  slug: "",
  description: null,
} as const;

interface NewCategoryPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function NewCategoryPage({
  searchParams,
}: NewCategoryPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const parentOptions = await getCategoryParentOptionsAction();
  const parentId = typeof params.parentId === "string" ? params.parentId : null;

  const defaultValues: CategoryFormValues = {
    parentId,
    sortOrder: 0,
    status: "draft",
    translations: {
      uk: { ...EMPTY_TRANSLATION },
      en: { ...EMPTY_TRANSLATION },
    },
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="New category"
        description="Create a taxonomy node with Ukrainian and English content."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: "New category" },
        ]}
      />

      <div className="mt-8">
        <CategoryForm mode="create" defaultValues={defaultValues} parentOptions={parentOptions} />
      </div>
    </div>
  );
}
