import {
  parsePublicApiSearchParams,
  publicApiValidationError,
  runAuthenticatedPublicApiRoute,
} from "@/lib/api/handlePublicApiRoute";
import { publicApiSeoProfilesQuerySchema } from "@/schemas/api/publicApiSchemas";
import { listPublicApiSeoProfiles } from "@/services/publicApiService";

export async function GET(request: Request): Promise<Response> {
  const parsed = publicApiSeoProfilesQuerySchema.safeParse(
    Object.fromEntries(parsePublicApiSearchParams(request.url)),
  );

  if (!parsed.success) {
    return publicApiValidationError(parsed.error.errors[0]?.message ?? "Invalid query");
  }

  return runAuthenticatedPublicApiRoute({
    request,
    scope: "read:seo",
    execute: async () => {
      const result = await listPublicApiSeoProfiles(parsed.data);
      return { data: result.items, meta: result.meta };
    },
  });
}
