"use server";

import { listWebhookDeliveries, listWebhookEndpoints } from "@/services/webhookService";

import type { WebhookDeliveryListItem, WebhookEndpointListItem } from "@/types/webhooks";

export async function listWebhookEndpointsAction(): Promise<WebhookEndpointListItem[]> {
  return listWebhookEndpoints();
}

export async function listWebhookDeliveriesAction(): Promise<WebhookDeliveryListItem[]> {
  return listWebhookDeliveries(20);
}
