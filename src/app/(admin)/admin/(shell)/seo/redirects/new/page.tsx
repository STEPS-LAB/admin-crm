import { PageHeader } from "@/components/navigation/PageHeader";
import { RedirectForm } from "@/features/seo/components/RedirectForm";

export const metadata = {
  title: "New redirect",
};

export default function NewRedirectPage(): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="New redirect"
        description="Map an old URL to a new destination"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SEO Center", href: "/admin/seo" },
          { label: "Redirects", href: "/admin/seo/redirects" },
          { label: "New" },
        ]}
      />

      <div className="mt-8 max-w-2xl">
        <RedirectForm
          mode="create"
          defaultValues={{
            source: "",
            destination: "",
            statusCode: "301",
            enabled: true,
          }}
        />
      </div>
    </>
  );
}
