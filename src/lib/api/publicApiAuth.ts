import { API_KEY_PREFIX } from "@/constants/api";
import { hashApiKey } from "@/lib/api/apiKeys";

export function extractBearerApiKey(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token.startsWith(API_KEY_PREFIX)) {
    return null;
  }

  return token;
}

export function hashBearerApiKey(token: string): string {
  return hashApiKey(token);
}

export function hasApiScope(
  scopes: readonly string[],
  requiredScope: string,
): boolean {
  return scopes.includes(requiredScope);
}
