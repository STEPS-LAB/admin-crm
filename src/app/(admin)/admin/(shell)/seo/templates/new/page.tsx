import { PageHeader } from "@/components/navigation/PageHeader";
import { SeoTemplateForm } from "@/features/seo/components/SeoTemplateForm";

export const metadata = {
  title: "New SEO Template",
};

export default function NewSeoTemplatePage(): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="New SEO template"
        description="Define reusable metadata patterns with variables and live preview."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SEO Center", href: "/admin/seo" },
          { label: "Templates", href: "/admin/seo/templates" },
          { label: "New" },
        ]}
      />

      <div className="mt-8">
        <SeoTemplateForm
          mode="create"
          defaultValues={{
            ownerType: "product",
            language: "uk",
            name: "",
            metaTitleTemplate: "{{product.name}} — {{site.name}}",
            metaDescriptionTemplate: "{{product.short_description}}",
            ogTitleTemplate: "{{product.name}}",
            ogDescriptionTemplate: "{{product.short_description}}",
            isDefault: false,
          }}
        />
      </div>
    </>
  );
}
