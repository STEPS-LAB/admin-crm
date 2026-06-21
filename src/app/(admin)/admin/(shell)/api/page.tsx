import Link from "next/link";

import {
  getApiOverviewAction,
  listApiKeysAction,
  listWebhookDeliveriesAction,
  listWebhookEndpointsAction,
} from "@/actions/api";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { ApiArchitecturePanel } from "@/features/api/components/ApiArchitecturePanel";
import { ApiKeysPanel } from "@/features/api/components/ApiKeysPanel";
import { ApiOverviewStats } from "@/features/api/components/ApiOverviewStats";
import { PreparedEndpointsPanel } from "@/features/api/components/PreparedEndpointsPanel";
import { WebhooksPanel } from "@/features/api/components/WebhooksPanel";
import { getSettings } from "@/services/settingsService";

export const metadata = {
  title: "API",
};

export default async function ApiCenterPage(): Promise<React.JSX.Element> {
  const [overview, apiKeys, webhookEndpoints, webhookDeliveries, settings] = await Promise.all([
    getApiOverviewAction(),
    listApiKeysAction(),
    listWebhookEndpointsAction(),
    listWebhookDeliveriesAction(),
    getSettings(),
  ]);

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="API"
        description="Internal Server Actions, scoped keys, and prepared public integrations"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "API" }]}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/api/docs">OpenAPI docs</Link>
          </Button>
        }
      />

      <div className="mt-8 space-y-8">
        <ApiOverviewStats overview={overview} />
        <ApiKeysPanel items={apiKeys} />

        <div className="grid gap-6 xl:grid-cols-2">
          <ApiArchitecturePanel />
          <WebhooksPanel
            endpoints={webhookEndpoints}
            deliveries={webhookDeliveries}
            webhookMaxRetries={settings.webhookMaxRetries}
            webhookRetryBaseDelaySeconds={settings.webhookRetryBaseDelaySeconds}
          />
        </div>

        <PreparedEndpointsPanel />
      </div>
    </div>
  );
}
