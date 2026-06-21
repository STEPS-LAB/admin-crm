import {
  parsePublicApiSearchParams,
  publicApiValidationError,
  runAuthenticatedPublicApiRoute,
} from "@/lib/api/handlePublicApiRoute";
import { publicApiListQuerySchema } from "@/schemas/api/publicApiSchemas";
import { listPublicApiCategories } from "@/services/publicApiService";

export async function GET(request: Request): Promise<Response> {
  const parsed = publicApiListQuerySchema.safeParse(
    Object.fromEntries(parsePublicApiSearchParams(request.url)),
  );

  if (!parsed.success) {
    return publicApiValidationError(parsed.error.errors[0]?.message ?? "Invalid query");
  }

  return runAuthenticatedPublicApiRoute({
    request,
    scope: "read:categories",
    execute: async () => {
      const result = await listPublicApiCategories(parsed.data);
      return { data: result.items, meta: result.meta };
    },
  });
}
