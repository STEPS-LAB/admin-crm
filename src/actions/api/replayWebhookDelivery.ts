"use server";

import { revalidatePath } from "next/cache";

import { replayWebhookDelivery } from "@/services/webhookService";

import type { ServerActionResult } from "@/types";

export async function replayWebhookDeliveryAction(
  deliveryId: string,
): Promise<ServerActionResult<{ readonly id: string }>> {
  try {
    await replayWebhookDelivery(deliveryId);
    revalidatePath("/admin/api");
    return { success: true, data: { id: deliveryId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to replay webhook delivery",
      code: "REPLAY_FAILED",
    };
  }
}
