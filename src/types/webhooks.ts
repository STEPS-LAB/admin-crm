import type { PreparedWebhookEvent } from "@/constants/api";

export type WebhookEndpointStatus = "active" | "disabled";

export type WebhookDeliveryStatus = "pending" | "success" | "failed" | "dead";

export interface WebhookEndpointListItem {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly secretPrefix: string;
  readonly events: readonly PreparedWebhookEvent[];
  readonly status: WebhookEndpointStatus;
  readonly description: string | null;
  readonly lastDeliveryAt: Date | null;
  readonly lastDeliveryStatus: WebhookDeliveryStatus | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateWebhookEndpointInput {
  readonly name: string;
  readonly url: string;
  readonly events: readonly PreparedWebhookEvent[];
  readonly description?: string | null;
}

export interface CreateWebhookEndpointResult {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly secretPrefix: string;
  readonly plainTextSecret: string;
  readonly events: readonly PreparedWebhookEvent[];
  readonly createdAt: Date;
}

export interface WebhookDeliveryListItem {
  readonly id: string;
  readonly endpointId: string;
  readonly endpointName: string;
  readonly event: PreparedWebhookEvent;
  readonly status: WebhookDeliveryStatus;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly responseStatus: number | null;
  readonly errorMessage: string | null;
  readonly nextRetryAt: Date | null;
  readonly deliveredAt: Date | null;
  readonly createdAt: Date;
}

export interface WebhookDeliveryDetail {
  readonly id: string;
  readonly endpointId: string;
  readonly endpointName: string;
  readonly event: PreparedWebhookEvent;
  readonly status: WebhookDeliveryStatus;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly payload: Record<string, unknown>;
  readonly responseStatus: number | null;
  readonly responseBody: string | null;
  readonly errorMessage: string | null;
  readonly nextRetryAt: Date | null;
  readonly lastAttemptAt: Date | null;
  readonly deliveredAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface WebhookEventPayload {
  readonly id: string;
  readonly event: PreparedWebhookEvent;
  readonly createdAt: string;
  readonly data: Record<string, unknown>;
}
