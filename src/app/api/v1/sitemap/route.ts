import {
  parsePublicApiSearchParams,
  publicApiValidationError,
  runAuthenticatedPublicApiRoute,
} from "@/lib/api/handlePublicApiRoute";
import { publicApiSitemapQuerySchema } from "@/schemas/api/publicApiSchemas";
import { getPublicApiSitemap } from "@/services/publicApiService";

export async function GET(request: Request): Promise<Response> {
  const parsed = publicApiSitemapQuerySchema.safeParse(
    Object.fromEntries(parsePublicApiSearchParams(request.url)),
  );

  if (!parsed.success) {
    return publicApiValidationError(parsed.error.errors[0]?.message ?? "Invalid query");
  }

  return runAuthenticatedPublicApiRoute({
    request,
    scope: "read:sitemap",
    execute: async () => {
      const result = await getPublicApiSitemap(parsed.data);
      return { data: result.data, meta: result.meta };
    },
  });
}
