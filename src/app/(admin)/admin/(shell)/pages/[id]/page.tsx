import { notFound } from "next/navigation";

import { getPageAction, getPageMediaAction, getPageSeoProfilesAction } from "@/actions/pages";
import { PageHeader } from "@/components/navigation/PageHeader";
import { PageForm } from "@/features/pages/components/PageForm";
import { PageStatusBadge } from "@/features/pages/components/PageStatusBadge";
import { getOwnerSeoScore } from "@/services/publishWarningsService";

import type { PageFormValues } from "@/schemas/pages/pageSchemas";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{ title: string }> {
  const { id } = await params;
  const page = await getPageAction(id);

  return {
    title: page?.translations.uk.title ?? "Edit page",
  };
}

interface EditPagePageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditPagePage({
  params,
}: EditPagePageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const [page, media, seoProfiles, seoScore] = await Promise.all([
    getPageAction(id),
    getPageMediaAction(id),
    getPageSeoProfilesAction(id),
    getOwnerSeoScore("page", id),
  ]);

  if (!page || !media || !seoProfiles) {
    notFound();
  }

  const defaultValues: PageFormValues = {
    pageType: page.pageType,
    status: page.status,
    isHomepage: page.isHomepage,
    sortOrder: page.sortOrder,
    translations: page.translations,
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title={page.translations.uk.title}
        description={page.isHomepage ? "Homepage" : `/${page.translations.uk.slug}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Pages", href: "/admin/pages" },
          { label: page.translations.uk.title },
        ]}
        actions={<PageStatusBadge status={page.status} />}
      />

      <div className="mt-8">
        <PageForm
          mode="edit"
          pageId={page.id}
          defaultValues={defaultValues}
          media={media}
          seoProfiles={seoProfiles}
          seoScore={seoScore}
        />
      </div>
    </div>
  );
}
