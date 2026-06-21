import { getSettingsAction } from "@/actions/settings";
import { PageHeader } from "@/components/navigation/PageHeader";
import { GeneralSettingsForm } from "@/features/settings/components/GeneralSettingsForm";
import type { GeneralSettingsValues } from "@/schemas/settings/settingsSchemas";

export const metadata = {
  title: "General Settings",
};

export default async function GeneralSettingsPage(): Promise<React.JSX.Element> {
  const settings = await getSettingsAction();

  return (
    <>
      <PageHeader
        title="General"
        description="Site identity and branding"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }, { label: "General" }]}
      />

      <div className="mt-8 max-w-4xl">
        <GeneralSettingsForm
          defaultValues={{
            siteName: settings.siteName,
            siteDescription: settings.siteDescription,
            siteUrl: settings.siteUrl,
            logoUrl: settings.logoUrl,
            faviconUrl: settings.faviconUrl,
          } satisfies GeneralSettingsValues}
        />
      </div>
    </>
  );
}
