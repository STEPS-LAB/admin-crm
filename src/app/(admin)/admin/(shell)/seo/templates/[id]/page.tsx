import { notFound } from "next/navigation";

import { getSeoTemplateAction } from "@/actions/seo";
import { PageHeader } from "@/components/navigation/PageHeader";
import { SeoTemplateForm } from "@/features/seo/components/SeoTemplateForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{ title: string }> {
  const { id } = await params;
  const template = await getSeoTemplateAction(id);

  return {
    title: template?.name ?? "SEO Template",
  };
}

interface SeoTemplateDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function SeoTemplateDetailPage({
  params,
}: SeoTemplateDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const template = await getSeoTemplateAction(id);

  if (!template) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={template.name}
        description={`${template.ownerType} · ${template.language.toUpperCase()}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SEO Center", href: "/admin/seo" },
          { label: "Templates", href: "/admin/seo/templates" },
          { label: template.name },
        ]}
      />

      <div className="mt-8">
        <SeoTemplateForm
          mode="edit"
          templateId={template.id}
          defaultValues={{
            ownerType: template.ownerType,
            language: template.language,
            name: template.name,
            metaTitleTemplate: template.metaTitleTemplate,
            metaDescriptionTemplate: template.metaDescriptionTemplate,
            ogTitleTemplate: template.ogTitleTemplate,
            ogDescriptionTemplate: template.ogDescriptionTemplate,
            isDefault: template.isDefault,
          }}
        />
      </div>
    </>
  );
}
