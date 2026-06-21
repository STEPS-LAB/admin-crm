import {
  WEBHOOK_DELIVERY_TIMEOUT_MS,
  WEBHOOK_RESPONSE_BODY_MAX_LENGTH,
  type PreparedWebhookEvent,
} from "@/constants/api";
import { decryptWebhookSecret, generateWebhookSecret } from "@/lib/api/webhookSecrets";
import { signWebhookPayload } from "@/lib/api/webhookSigning";
import { computeWebhookNextRetryAt } from "@/lib/webhooks/retrySchedule";
import {
  deleteWebhookEndpoint,
  findActiveWebhookEndpointsByEvent,
  findDueWebhookDeliveries,
  findWebhookDeliveries,
  findWebhookDeliveryById,
  findWebhookDeliveryDetail,
  findWebhookEndpointDeliveryContext,
  findWebhookDeliveryForProfile,
  findWebhookEndpoints,
  insertWebhookDelivery,
  insertWebhookEndpoint,
  markWebhookDeliveryRetry,
  markWebhookDeliverySuccess,
  resetWebhookDeliveryForReplay,
  updateWebhookEndpointStatus,
} from "@/repositories/webhookRepository";
import { findSettings } from "@/repositories/settingsRepository";
import { getAuthenticatedUser } from "@/services/authenticationService";

import type { AuthUser } from "@/types/auth";
import type {
  CreateWebhookEndpointInput,
  CreateWebhookEndpointResult,
  WebhookDeliveryListItem,
  WebhookDeliveryDetail,
  WebhookEndpointListItem,
  WebhookEventPayload,
} from "@/types/webhooks";

const DUE_DELIVERY_BATCH_SIZE = 25;

async function requireWebhookSettings() {
  const settings = await findSettings();

  if (!settings) {
    throw new Error("Settings record not found");
  }

  return settings;
}

async function requireAuthenticatedUser(): Promise<AuthUser> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

function buildDeliveryBody(delivery: {
  id: string;
  event: PreparedWebhookEvent;
  createdAt: Date;
  payload: Record<string, unknown>;
}): string {
  const envelope: WebhookEventPayload = {
    id: delivery.id,
    event: delivery.event,
    createdAt: delivery.createdAt.toISOString(),
    data: delivery.payload,
  };

  return JSON.stringify(envelope);
}

function truncateResponseBody(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.length > WEBHOOK_RESPONSE_BODY_MAX_LENGTH
    ? value.slice(0, WEBHOOK_RESPONSE_BODY_MAX_LENGTH)
    : value;
}

export async function listWebhookEndpoints(): Promise<WebhookEndpointListItem[]> {
  const user = await requireAuthenticatedUser();

  return findWebhookEndpoints(user.id);
}

export async function listWebhookDeliveries(limit = 20): Promise<WebhookDeliveryListItem[]> {
  const user = await requireAuthenticatedUser();

  return findWebhookDeliveries(user.id, limit);
}

export async function getWebhookDeliveryDetail(
  deliveryId: string,
): Promise<WebhookDeliveryDetail> {
  const user = await requireAuthenticatedUser();
  const delivery = await findWebhookDeliveryDetail(user.id, deliveryId);

  if (!delivery) {
    throw new Error("Webhook delivery not found");
  }

  return delivery;
}

export async function createWebhookEndpoint(
  input: CreateWebhookEndpointInput,
): Promise<CreateWebhookEndpointResult> {
  const user = await requireAuthenticatedUser();
  const generated = generateWebhookSecret();

  const endpoint = await insertWebhookEndpoint({
    profileId: user.id,
    name: input.name,
    url: input.url,
    secretPrefix: generated.prefix,
    secretCiphertext: generated.ciphertext,
    events: input.events,
    description: input.description ?? null,
  });

  return {
    id: endpoint.id,
    name: endpoint.name,
    url: endpoint.url,
    secretPrefix: endpoint.secretPrefix,
    plainTextSecret: generated.fullSecret,
    events: endpoint.events,
    createdAt: endpoint.createdAt,
  };
}

export async function setWebhookEndpointStatus(
  endpointId: string,
  status: "active" | "disabled",
): Promise<WebhookEndpointListItem> {
  const user = await requireAuthenticatedUser();
  const updated = await updateWebhookEndpointStatus(user.id, endpointId, status);

  if (!updated) {
    throw new Error("Webhook endpoint not found");
  }

  return updated;
}

export async function removeWebhookEndpoint(endpointId: string): Promise<void> {
  const user = await requireAuthenticatedUser();
  const deleted = await deleteWebhookEndpoint(user.id, endpointId);

  if (!deleted) {
    throw new Error("Webhook endpoint not found");
  }
}

export async function processWebhookDelivery(deliveryId: string): Promise<void> {
  const delivery = await findWebhookDeliveryById(deliveryId);

  if (!delivery || delivery.status === "success" || delivery.status === "dead") {
    return;
  }

  const endpoint = await findWebhookEndpointDeliveryContext(delivery.endpointId);

  if (!endpoint) {
    await markWebhookDeliveryRetry({
      deliveryId,
      responseStatus: null,
      responseBody: null,
      errorMessage: "Webhook endpoint is inactive or missing",
      nextRetryAt: null,
      status: "dead",
      attemptCount: delivery.attemptCount + 1,
    });
    return;
  }

  const settings = await requireWebhookSettings();
  const secret = decryptWebhookSecret(endpoint.secretCiphertext);
  const timestamp = Math.floor(Date.now() / 1_000);
  const body = buildDeliveryBody(delivery);
  const signature = signWebhookPayload(secret, timestamp, body);
  const nextAttemptCount = delivery.attemptCount + 1;

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CMS-Event": delivery.event,
        "X-CMS-Delivery-Id": delivery.id,
        "X-CMS-Timestamp": String(timestamp),
        "X-CMS-Signature": `sha256=${signature}`,
        "User-Agent": "AdminCRM-Webhooks/1.0",
      },
      body,
      signal: AbortSignal.timeout(WEBHOOK_DELIVERY_TIMEOUT_MS),
    });

    const responseBody = truncateResponseBody(await response.text());

    if (response.ok) {
      await markWebhookDeliverySuccess({
        deliveryId,
        responseStatus: response.status,
        responseBody,
        attemptCount: nextAttemptCount,
      });
      return;
    }

    await scheduleWebhookRetry({
      delivery,
      attemptCount: nextAttemptCount,
      responseStatus: response.status,
      responseBody,
      errorMessage: `Webhook endpoint responded with HTTP ${response.status}`,
      baseDelaySeconds: settings.webhookRetryBaseDelaySeconds,
    });
  } catch (error) {
    await scheduleWebhookRetry({
      delivery,
      attemptCount: nextAttemptCount,
      responseStatus: null,
      responseBody: null,
      errorMessage: error instanceof Error ? error.message : "Webhook delivery failed",
      baseDelaySeconds: settings.webhookRetryBaseDelaySeconds,
    });
  }
}

async function scheduleWebhookRetry({
  delivery,
  attemptCount,
  responseStatus,
  responseBody,
  errorMessage,
  baseDelaySeconds,
}: {
  delivery: {
    id: string;
    maxAttempts: number;
  };
  attemptCount: number;
  responseStatus: number | null;
  responseBody: string | null;
  errorMessage: string;
  baseDelaySeconds: number;
}): Promise<void> {
  if (attemptCount >= delivery.maxAttempts) {
    await markWebhookDeliveryRetry({
      deliveryId: delivery.id,
      responseStatus,
      responseBody,
      errorMessage,
      nextRetryAt: null,
      status: "dead",
      attemptCount,
    });
    return;
  }

  await markWebhookDeliveryRetry({
    deliveryId: delivery.id,
    responseStatus,
    responseBody,
    errorMessage,
    nextRetryAt: computeWebhookNextRetryAt(attemptCount, baseDelaySeconds),
    status: "pending",
    attemptCount,
  });
}

export async function processDueWebhookDeliveries(): Promise<number> {
  const deliveryIds = await findDueWebhookDeliveries(DUE_DELIVERY_BATCH_SIZE);

  for (const deliveryId of deliveryIds) {
    await processWebhookDelivery(deliveryId);
  }

  return deliveryIds.length;
}

export async function replayWebhookDelivery(deliveryId: string): Promise<void> {
  const user = await requireAuthenticatedUser();
  const delivery = await findWebhookDeliveryForProfile(user.id, deliveryId);

  if (!delivery) {
    throw new Error("Webhook delivery not found");
  }

  if (delivery.status === "success") {
    throw new Error("Successful deliveries cannot be replayed");
  }

  const settings = await requireWebhookSettings();

  await resetWebhookDeliveryForReplay({
    deliveryId,
    maxAttempts: settings.webhookMaxRetries,
  });

  await processWebhookDelivery(deliveryId);
}

export async function dispatchWebhookEvent(
  event: PreparedWebhookEvent,
  payload: Record<string, unknown>,
): Promise<void> {
  await processDueWebhookDeliveries();

  const [endpoints, settings] = await Promise.all([
    findActiveWebhookEndpointsByEvent(event),
    requireWebhookSettings(),
  ]);

  for (const endpoint of endpoints) {
    const deliveryId = await insertWebhookDelivery({
      endpointId: endpoint.id,
      event,
      payload,
      maxAttempts: settings.webhookMaxRetries,
    });

    await processWebhookDelivery(deliveryId);
  }
}

export function emitWebhookEvent(
  event: PreparedWebhookEvent,
  payload: Record<string, unknown>,
): void {
  void dispatchWebhookEvent(event, payload);
}
