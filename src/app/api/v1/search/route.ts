import {
  parsePublicApiSearchParams,
  publicApiValidationError,
  runAuthenticatedPublicApiRoute,
} from "@/lib/api/handlePublicApiRoute";
import { publicApiSearchQuerySchema } from "@/schemas/api/publicApiSchemas";
import { searchPublicApiCatalog } from "@/services/publicApiService";

export async function GET(request: Request): Promise<Response> {
  const parsed = publicApiSearchQuerySchema.safeParse(
    Object.fromEntries(parsePublicApiSearchParams(request.url)),
  );

  if (!parsed.success) {
    return publicApiValidationError(parsed.error.errors[0]?.message ?? "Invalid query");
  }

  return runAuthenticatedPublicApiRoute({
    request,
    scope: "read:search",
    execute: async () => {
      const result = await searchPublicApiCatalog(parsed.data);
      return {
        data: result,
        meta: {
          language: parsed.data.lang,
          query: parsed.data.q,
          limit: parsed.data.limit,
        },
      };
    },
  });
}
