"use server";

import { getWebhookDeliveryDetail } from "@/services/webhookService";

import type { ServerActionResult } from "@/types";
import type { WebhookDeliveryDetail } from "@/types/webhooks";

export async function getWebhookDeliveryDetailAction(
  deliveryId: string,
): Promise<ServerActionResult<WebhookDeliveryDetail>> {
  try {
    const detail = await getWebhookDeliveryDetail(deliveryId);
    return { success: true, data: detail };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load webhook delivery",
      code: "LOAD_FAILED",
    };
  }
}
