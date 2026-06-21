const CRON_AUTH_HEADER = "authorization";

export function isCronRequestAuthorized(request: Request): boolean {
  const configuredSecret = process.env.CRON_SECRET?.trim();

  if (!configuredSecret) {
    return false;
  }

  const authorization = request.headers.get(CRON_AUTH_HEADER);

  if (!authorization) {
    return false;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return false;
  }

  return token === configuredSecret;
}
