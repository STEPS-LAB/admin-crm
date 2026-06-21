import { PageForm } from "@/features/pages/components/PageForm";
import { PageHeader } from "@/components/navigation/PageHeader";

import type { PageFormValues } from "@/schemas/pages/pageSchemas";

export const metadata = {
  title: "New page",
};

export default function NewPagePage(): React.JSX.Element {
  const defaultValues: PageFormValues = {
    pageType: "static",
    status: "draft",
    isHomepage: false,
    sortOrder: 0,
    translations: {
      uk: { title: "", slug: "", content: null, excerpt: null },
      en: { title: "", slug: "", content: null, excerpt: null },
    },
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="New page"
        description="Create a static or landing page with multilingual content."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Pages", href: "/admin/pages" },
          { label: "New" },
        ]}
      />

      <div className="mt-8">
        <PageForm mode="create" defaultValues={defaultValues} />
      </div>
    </div>
  );
}
