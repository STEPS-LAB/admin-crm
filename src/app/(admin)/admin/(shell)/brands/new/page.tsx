import { PageHeader } from "@/components/navigation/PageHeader";
import { BrandForm } from "@/features/brands/components/BrandForm";

import type { BrandFormValues } from "@/schemas/brands/brandSchemas";

export const metadata = {
  title: "New brand",
};

const defaultValues: BrandFormValues = {
  slug: "",
  logoUrl: null,
  website: null,
  country: null,
  status: "draft",
  translations: {
    uk: { name: "", description: null },
    en: { name: "", description: null },
  },
};

export default function NewBrandPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="New brand"
        description="Create a manufacturer or vendor brand"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Brands", href: "/admin/brands" },
          { label: "New" },
        ]}
      />

      <div className="mt-8">
        <BrandForm mode="create" defaultValues={defaultValues} />
      </div>
    </div>
  );
}
