import { createHmac, timingSafeEqual } from "node:crypto";

export function buildWebhookSignaturePayload(timestamp: number, body: string): string {
  return `${timestamp}.${body}`;
}

export function signWebhookPayload(secret: string, timestamp: number, body: string): string {
  return createHmac("sha256", secret)
    .update(buildWebhookSignaturePayload(timestamp, body))
    .digest("hex");
}

export function verifyWebhookSignature(
  secret: string,
  timestamp: number,
  body: string,
  signature: string,
): boolean {
  const expected = signWebhookPayload(secret, timestamp, body);
  const provided = signature.startsWith("sha256=") ? signature.slice(7) : signature;

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}
