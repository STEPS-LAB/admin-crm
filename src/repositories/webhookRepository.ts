import { and, count, desc, eq, isNull, lte, or, sql, type SQL } from "drizzle-orm";

import type { PreparedWebhookEvent } from "@/constants/api";
import { getDb } from "@/db/client";
import { webhookDeliveries, webhookEndpoints } from "@/db/schema/api";

import type {
  WebhookDeliveryListItem,
  WebhookDeliveryDetail,
  WebhookDeliveryStatus,
  WebhookEndpointListItem,
  WebhookEndpointStatus,
} from "@/types/webhooks";

function profileScope(profileId: string): SQL {
  return eq(webhookEndpoints.profileId, profileId);
}

function mapEndpointRow(row: {
  id: string;
  name: string;
  url: string;
  secretPrefix: string;
  events: string[] | null;
  status: WebhookEndpointStatus;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastDeliveryAt: Date | null;
  lastDeliveryStatus: WebhookDeliveryStatus | null;
}): WebhookEndpointListItem {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    secretPrefix: row.secretPrefix,
    events: (row.events ?? []) as PreparedWebhookEvent[],
    status: row.status,
    description: row.description,
    lastDeliveryAt: row.lastDeliveryAt,
    lastDeliveryStatus: row.lastDeliveryStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function findWebhookEndpoints(profileId: string): Promise<WebhookEndpointListItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: webhookEndpoints.id,
      name: webhookEndpoints.name,
      url: webhookEndpoints.url,
      secretPrefix: webhookEndpoints.secretPrefix,
      events: webhookEndpoints.events,
      status: webhookEndpoints.status,
      description: webhookEndpoints.description,
      createdAt: webhookEndpoints.createdAt,
      updatedAt: webhookEndpoints.updatedAt,
      lastDeliveryAt: sql<Date | null>`(
        select max(${webhookDeliveries.createdAt})
        from ${webhookDeliveries}
        where ${webhookDeliveries.endpointId} = ${webhookEndpoints.id}
      )`,
      lastDeliveryStatus: sql<WebhookDeliveryStatus | null>`(
        select ${webhookDeliveries.status}
        from ${webhookDeliveries}
        where ${webhookDeliveries.endpointId} = ${webhookEndpoints.id}
        order by ${webhookDeliveries.createdAt} desc
        limit 1
      )`,
    })
    .from(webhookEndpoints)
    .where(profileScope(profileId))
    .orderBy(desc(webhookEndpoints.createdAt));

  return rows.map(mapEndpointRow);
}

export async function countWebhookEndpoints(profileId: string): Promise<number> {
  const db = getDb();

  const [row] = await db
    .select({ total: count() })
    .from(webhookEndpoints)
    .where(profileScope(profileId));

  return Number(row?.total ?? 0);
}

export async function insertWebhookEndpoint(input: {
  profileId: string;
  name: string;
  url: string;
  secretPrefix: string;
  secretCiphertext: string;
  events: readonly PreparedWebhookEvent[];
  description: string | null;
}): Promise<WebhookEndpointListItem> {
  const db = getDb();

  const [row] = await db
    .insert(webhookEndpoints)
    .values({
      profileId: input.profileId,
      name: input.name,
      url: input.url,
      secretPrefix: input.secretPrefix,
      secretCiphertext: input.secretCiphertext,
      events: [...input.events],
      description: input.description,
    })
    .returning({
      id: webhookEndpoints.id,
      name: webhookEndpoints.name,
      url: webhookEndpoints.url,
      secretPrefix: webhookEndpoints.secretPrefix,
      events: webhookEndpoints.events,
      status: webhookEndpoints.status,
      description: webhookEndpoints.description,
      createdAt: webhookEndpoints.createdAt,
      updatedAt: webhookEndpoints.updatedAt,
    });

  if (!row) {
    throw new Error("Failed to create webhook endpoint");
  }

  return mapEndpointRow({
    ...row,
    lastDeliveryAt: null,
    lastDeliveryStatus: null,
  });
}

export async function findWebhookEndpointById(
  profileId: string,
  endpointId: string,
): Promise<WebhookEndpointListItem | null> {
  const db = getDb();

  const [row] = await db
    .select({
      id: webhookEndpoints.id,
      name: webhookEndpoints.name,
      url: webhookEndpoints.url,
      secretPrefix: webhookEndpoints.secretPrefix,
      events: webhookEndpoints.events,
      status: webhookEndpoints.status,
      description: webhookEndpoints.description,
      createdAt: webhookEndpoints.createdAt,
      updatedAt: webhookEndpoints.updatedAt,
      lastDeliveryAt: sql<Date | null>`null`,
      lastDeliveryStatus: sql<WebhookDeliveryStatus | null>`null`,
    })
    .from(webhookEndpoints)
    .where(and(profileScope(profileId), eq(webhookEndpoints.id, endpointId)))
    .limit(1);

  return row ? mapEndpointRow(row) : null;
}

export interface ActiveWebhookEndpointRecord {
  readonly id: string;
  readonly url: string;
  readonly secretCiphertext: string;
  readonly events: readonly PreparedWebhookEvent[];
}

export async function findActiveWebhookEndpointsByEvent(
  event: PreparedWebhookEvent,
): Promise<ActiveWebhookEndpointRecord[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: webhookEndpoints.id,
      url: webhookEndpoints.url,
      secretCiphertext: webhookEndpoints.secretCiphertext,
      events: webhookEndpoints.events,
    })
    .from(webhookEndpoints)
    .where(eq(webhookEndpoints.status, "active"));

  return rows
    .filter((row) => (row.events ?? []).includes(event))
    .map((row) => ({
      id: row.id,
      url: row.url,
      secretCiphertext: row.secretCiphertext,
      events: (row.events ?? []) as PreparedWebhookEvent[],
    }));
}

export async function updateWebhookEndpointStatus(
  profileId: string,
  endpointId: string,
  status: WebhookEndpointStatus,
): Promise<WebhookEndpointListItem | null> {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .update(webhookEndpoints)
    .set({
      status,
      updatedAt: now,
    })
    .where(and(profileScope(profileId), eq(webhookEndpoints.id, endpointId)))
    .returning({
      id: webhookEndpoints.id,
      name: webhookEndpoints.name,
      url: webhookEndpoints.url,
      secretPrefix: webhookEndpoints.secretPrefix,
      events: webhookEndpoints.events,
      status: webhookEndpoints.status,
      description: webhookEndpoints.description,
      createdAt: webhookEndpoints.createdAt,
      updatedAt: webhookEndpoints.updatedAt,
    });

  return row
    ? mapEndpointRow({
        ...row,
        lastDeliveryAt: null,
        lastDeliveryStatus: null,
      })
    : null;
}

export async function deleteWebhookEndpoint(
  profileId: string,
  endpointId: string,
): Promise<boolean> {
  const db = getDb();

  const rows = await db
    .delete(webhookEndpoints)
    .where(and(profileScope(profileId), eq(webhookEndpoints.id, endpointId)))
    .returning({ id: webhookEndpoints.id });

  return rows.length > 0;
}

export async function insertWebhookDelivery(input: {
  endpointId: string;
  event: PreparedWebhookEvent;
  payload: Record<string, unknown>;
  maxAttempts: number;
}): Promise<string> {
  const db = getDb();

  const [row] = await db
    .insert(webhookDeliveries)
    .values({
      endpointId: input.endpointId,
      event: input.event,
      payload: input.payload,
      maxAttempts: input.maxAttempts,
      status: "pending",
    })
    .returning({ id: webhookDeliveries.id });

  if (!row) {
    throw new Error("Failed to create webhook delivery");
  }

  return row.id;
}

export interface WebhookDeliveryRecord {
  readonly id: string;
  readonly endpointId: string;
  readonly event: PreparedWebhookEvent;
  readonly payload: Record<string, unknown>;
  readonly status: WebhookDeliveryStatus;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly nextRetryAt: Date | null;
  readonly createdAt: Date;
}

export async function findWebhookDeliveryById(
  deliveryId: string,
): Promise<WebhookDeliveryRecord | null> {
  const db = getDb();

  const [row] = await db
    .select({
      id: webhookDeliveries.id,
      endpointId: webhookDeliveries.endpointId,
      event: webhookDeliveries.event,
      payload: webhookDeliveries.payload,
      status: webhookDeliveries.status,
      attemptCount: webhookDeliveries.attemptCount,
      maxAttempts: webhookDeliveries.maxAttempts,
      nextRetryAt: webhookDeliveries.nextRetryAt,
      createdAt: webhookDeliveries.createdAt,
    })
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.id, deliveryId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    endpointId: row.endpointId,
    event: row.event as PreparedWebhookEvent,
    payload: row.payload as Record<string, unknown>,
    status: row.status,
    attemptCount: row.attemptCount,
    maxAttempts: row.maxAttempts,
    nextRetryAt: row.nextRetryAt,
    createdAt: row.createdAt,
  };
}

export async function findWebhookDeliveryForProfile(
  profileId: string,
  deliveryId: string,
): Promise<WebhookDeliveryRecord | null> {
  const db = getDb();

  const [row] = await db
    .select({
      id: webhookDeliveries.id,
      endpointId: webhookDeliveries.endpointId,
      event: webhookDeliveries.event,
      payload: webhookDeliveries.payload,
      status: webhookDeliveries.status,
      attemptCount: webhookDeliveries.attemptCount,
      maxAttempts: webhookDeliveries.maxAttempts,
      nextRetryAt: webhookDeliveries.nextRetryAt,
      createdAt: webhookDeliveries.createdAt,
    })
    .from(webhookDeliveries)
    .innerJoin(webhookEndpoints, eq(webhookDeliveries.endpointId, webhookEndpoints.id))
    .where(and(profileScope(profileId), eq(webhookDeliveries.id, deliveryId)))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    endpointId: row.endpointId,
    event: row.event as PreparedWebhookEvent,
    payload: row.payload as Record<string, unknown>,
    status: row.status,
    attemptCount: row.attemptCount,
    maxAttempts: row.maxAttempts,
    nextRetryAt: row.nextRetryAt,
    createdAt: row.createdAt,
  };
}

export async function resetWebhookDeliveryForReplay(input: {
  deliveryId: string;
  maxAttempts: number;
}): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db
    .update(webhookDeliveries)
    .set({
      status: "pending",
      attemptCount: 0,
      maxAttempts: input.maxAttempts,
      nextRetryAt: null,
      lastAttemptAt: null,
      responseStatus: null,
      responseBody: null,
      errorMessage: null,
      deliveredAt: null,
      updatedAt: now,
    })
    .where(eq(webhookDeliveries.id, input.deliveryId));
}

export async function findDueWebhookDeliveries(limit: number): Promise<string[]> {
  const db = getDb();
  const now = new Date();

  const rows = await db
    .select({ id: webhookDeliveries.id })
    .from(webhookDeliveries)
    .where(
      and(
        eq(webhookDeliveries.status, "pending"),
        or(isNull(webhookDeliveries.nextRetryAt), lte(webhookDeliveries.nextRetryAt, now)),
      ),
    )
    .orderBy(webhookDeliveries.nextRetryAt)
    .limit(limit);

  return rows.map((row) => row.id);
}

export async function findWebhookDeliveries(
  profileId: string,
  limit: number,
): Promise<WebhookDeliveryListItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: webhookDeliveries.id,
      endpointId: webhookDeliveries.endpointId,
      endpointName: webhookEndpoints.name,
      event: webhookDeliveries.event,
      status: webhookDeliveries.status,
      attemptCount: webhookDeliveries.attemptCount,
      maxAttempts: webhookDeliveries.maxAttempts,
      responseStatus: webhookDeliveries.responseStatus,
      errorMessage: webhookDeliveries.errorMessage,
      nextRetryAt: webhookDeliveries.nextRetryAt,
      deliveredAt: webhookDeliveries.deliveredAt,
      createdAt: webhookDeliveries.createdAt,
    })
    .from(webhookDeliveries)
    .innerJoin(webhookEndpoints, eq(webhookDeliveries.endpointId, webhookEndpoints.id))
    .where(profileScope(profileId))
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    endpointId: row.endpointId,
    endpointName: row.endpointName,
    event: row.event as PreparedWebhookEvent,
    status: row.status,
    attemptCount: row.attemptCount,
    maxAttempts: row.maxAttempts,
    responseStatus: row.responseStatus,
    errorMessage: row.errorMessage,
    nextRetryAt: row.nextRetryAt,
    deliveredAt: row.deliveredAt,
    createdAt: row.createdAt,
  }));
}

export async function findWebhookDeliveryDetail(
  profileId: string,
  deliveryId: string,
): Promise<WebhookDeliveryDetail | null> {
  const db = getDb();

  const [row] = await db
    .select({
      id: webhookDeliveries.id,
      endpointId: webhookDeliveries.endpointId,
      endpointName: webhookEndpoints.name,
      event: webhookDeliveries.event,
      status: webhookDeliveries.status,
      attemptCount: webhookDeliveries.attemptCount,
      maxAttempts: webhookDeliveries.maxAttempts,
      payload: webhookDeliveries.payload,
      responseStatus: webhookDeliveries.responseStatus,
      responseBody: webhookDeliveries.responseBody,
      errorMessage: webhookDeliveries.errorMessage,
      nextRetryAt: webhookDeliveries.nextRetryAt,
      lastAttemptAt: webhookDeliveries.lastAttemptAt,
      deliveredAt: webhookDeliveries.deliveredAt,
      createdAt: webhookDeliveries.createdAt,
      updatedAt: webhookDeliveries.updatedAt,
    })
    .from(webhookDeliveries)
    .innerJoin(webhookEndpoints, eq(webhookDeliveries.endpointId, webhookEndpoints.id))
    .where(and(profileScope(profileId), eq(webhookDeliveries.id, deliveryId)))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    endpointId: row.endpointId,
    endpointName: row.endpointName,
    event: row.event as PreparedWebhookEvent,
    status: row.status,
    attemptCount: row.attemptCount,
    maxAttempts: row.maxAttempts,
    payload: row.payload as Record<string, unknown>,
    responseStatus: row.responseStatus,
    responseBody: row.responseBody,
    errorMessage: row.errorMessage,
    nextRetryAt: row.nextRetryAt,
    lastAttemptAt: row.lastAttemptAt,
    deliveredAt: row.deliveredAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function markWebhookDeliverySuccess(input: {
  deliveryId: string;
  responseStatus: number;
  responseBody: string | null;
  attemptCount: number;
}): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db
    .update(webhookDeliveries)
    .set({
      status: "success",
      attemptCount: input.attemptCount,
      lastAttemptAt: now,
      responseStatus: input.responseStatus,
      responseBody: input.responseBody,
      errorMessage: null,
      deliveredAt: now,
      nextRetryAt: null,
      updatedAt: now,
    })
    .where(eq(webhookDeliveries.id, input.deliveryId));
}

export async function markWebhookDeliveryRetry(input: {
  deliveryId: string;
  responseStatus: number | null;
  responseBody: string | null;
  errorMessage: string;
  nextRetryAt: Date | null;
  status: Extract<WebhookDeliveryStatus, "pending" | "dead">;
  attemptCount: number;
}): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db
    .update(webhookDeliveries)
    .set({
      status: input.status,
      attemptCount: input.attemptCount,
      lastAttemptAt: now,
      responseStatus: input.responseStatus,
      responseBody: input.responseBody,
      errorMessage: input.errorMessage,
      nextRetryAt: input.nextRetryAt,
      updatedAt: now,
    })
    .where(eq(webhookDeliveries.id, input.deliveryId));
}

export async function findWebhookEndpointDeliveryContext(
  endpointId: string,
): Promise<ActiveWebhookEndpointRecord | null> {
  const db = getDb();

  const [row] = await db
    .select({
      id: webhookEndpoints.id,
      url: webhookEndpoints.url,
      secretCiphertext: webhookEndpoints.secretCiphertext,
      events: webhookEndpoints.events,
      status: webhookEndpoints.status,
    })
    .from(webhookEndpoints)
    .where(eq(webhookEndpoints.id, endpointId))
    .limit(1);

  if (!row || row.status !== "active") {
    return null;
  }

  return {
    id: row.id,
    url: row.url,
    secretCiphertext: row.secretCiphertext,
    events: (row.events ?? []) as PreparedWebhookEvent[],
  };
}
