export function computeWebhookRetryDelaySeconds(
  attemptCount: number,
  baseDelaySeconds: number,
): number {
  const exponent = Math.max(0, attemptCount - 1);
  const delay = baseDelaySeconds * 2 ** exponent;

  return Math.min(delay, 3_600);
}

export function computeWebhookNextRetryAt(
  attemptCount: number,
  baseDelaySeconds: number,
  now: Date = new Date(),
): Date {
  const delaySeconds = computeWebhookRetryDelaySeconds(attemptCount, baseDelaySeconds);

  return new Date(now.getTime() + delaySeconds * 1_000);
}
