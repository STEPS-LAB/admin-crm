"use server";

import { createWebhookEndpointSchema } from "@/schemas/api/webhookSchemas";
import {
  createWebhookEndpoint,
  removeWebhookEndpoint,
  setWebhookEndpointStatus,
} from "@/services/webhookService";

import type { ServerActionResult } from "@/types";
import type { CreateWebhookEndpointResult } from "@/types/webhooks";

function parseCreateWebhookForm(formData: FormData) {
  const events = formData.getAll("events").map((value) => String(value));
  const descriptionRaw = formData.get("description");

  return createWebhookEndpointSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
    events,
    description:
      typeof descriptionRaw === "string" && descriptionRaw.length > 0 ? descriptionRaw : undefined,
  });
}

export async function createWebhookEndpointAction(
  _prevState: ServerActionResult<CreateWebhookEndpointResult> | null,
  formData: FormData,
): Promise<ServerActionResult<CreateWebhookEndpointResult>> {
  const parsed = parseCreateWebhookForm(formData);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const result = await createWebhookEndpoint({
      ...parsed.data,
      description: parsed.data.description ?? null,
    });
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create webhook endpoint",
      code: "CREATE_FAILED",
    };
  }
}

export async function setWebhookEndpointStatusAction(
  endpointId: string,
  status: "active" | "disabled",
): Promise<ServerActionResult<{ readonly id: string }>> {
  try {
    const result = await setWebhookEndpointStatus(endpointId, status);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update webhook endpoint",
      code: "UPDATE_FAILED",
    };
  }
}

export async function deleteWebhookEndpointAction(
  endpointId: string,
): Promise<ServerActionResult<{ readonly id: string }>> {
  try {
    await removeWebhookEndpoint(endpointId);
    return { success: true, data: { id: endpointId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete webhook endpoint",
      code: "DELETE_FAILED",
    };
  }
}
