import { getSettingsAction } from "@/actions/settings";
import { PageHeader } from "@/components/navigation/PageHeader";
import { IntegrationsSettingsForm } from "@/features/settings/components/IntegrationsSettingsForm";

export const metadata = {
  title: "Integrations",
};

export default async function IntegrationsSettingsPage(): Promise<React.JSX.Element> {
  const settings = await getSettingsAction();

  return (
    <>
      <PageHeader
        title="Integrations"
        description="Analytics, verification tags, and third-party services"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Integrations" },
        ]}
      />

      <div className="mt-8 max-w-4xl">
        <IntegrationsSettingsForm
          defaultValues={{
            googleAnalyticsId: settings.googleAnalyticsId,
            googleTagManagerId: settings.googleTagManagerId,
            googleSearchConsoleVerification: settings.googleSearchConsoleVerification,
            bingWebmasterVerification: settings.bingWebmasterVerification,
            facebookPixelId: settings.facebookPixelId,
          }}
        />
      </div>
    </>
  );
}
