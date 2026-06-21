import type { ApiScope } from "@/constants/api";
import { buildPublicApiRateLimitHeaders } from "@/lib/api/publicApiRateLimit";
import { publicApiError, publicApiSuccess } from "@/lib/api/publicApiResponse";
import { authenticatePublicApiRequest } from "@/services/publicApiAuthService";

import type { PublicApiSuccessResponse } from "@/types/public-api";

export interface PublicApiRouteResult<T> {
  readonly data: T;
  readonly meta?: PublicApiSuccessResponse<T>["meta"];
}

export class PublicApiNotFoundError extends Error {
  constructor(resource: string) {
    super(resource);
    this.name = "PublicApiNotFoundError";
  }
}

export async function runAuthenticatedPublicApiRoute<T>({
  request,
  scope,
  execute,
}: {
  readonly request: Request;
  readonly scope: ApiScope;
  readonly execute: () => Promise<PublicApiRouteResult<T>>;
}): Promise<Response> {
  const auth = await authenticatePublicApiRequest(request, scope);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const result = await execute();
    const response = publicApiSuccess(result.data, undefined, result.meta);
    const headers = buildPublicApiRateLimitHeaders(auth.rateLimit);

    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }

    return response;
  } catch (error) {
    if (error instanceof PublicApiNotFoundError) {
      return publicApiNotFound(error.message);
    }

    return publicApiError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unexpected API error",
      500,
    );
  }
}

export function parsePublicApiSearchParams(url: string): URLSearchParams {
  return new URL(url).searchParams;
}

export function publicApiNotFound(resource: string): Response {
  return publicApiError("NOT_FOUND", `${resource} not found`, 404);
}

export function publicApiValidationError(message: string): Response {
  return publicApiError("VALIDATION_ERROR", message, 400);
}
