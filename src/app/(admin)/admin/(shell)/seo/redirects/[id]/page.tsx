import { notFound } from "next/navigation";

import { getRedirectAction } from "@/actions/seo";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Badge } from "@/components/ui/badge";
import { RedirectForm } from "@/features/seo/components/RedirectForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{ title: string }> {
  const { id } = await params;
  const redirect = await getRedirectAction(id);

  return {
    title: redirect?.source ?? "Edit redirect",
  };
}

interface EditRedirectPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditRedirectPage({
  params,
}: EditRedirectPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const redirect = await getRedirectAction(id);

  if (!redirect) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={redirect.source}
        description={`→ ${redirect.destination}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SEO Center", href: "/admin/seo" },
          { label: "Redirects", href: "/admin/seo/redirects" },
          { label: redirect.source },
        ]}
        actions={
          <Badge variant={redirect.enabled ? "success" : "secondary"}>
            {redirect.enabled ? "Enabled" : "Disabled"}
          </Badge>
        }
      />

      <div className="mt-8 max-w-2xl">
        <RedirectForm
          mode="edit"
          redirectId={redirect.id}
          defaultValues={{
            source: redirect.source,
            destination: redirect.destination,
            statusCode: redirect.statusCode,
            enabled: redirect.enabled,
          }}
        />
      </div>
    </>
  );
}
