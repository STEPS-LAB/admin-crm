import {
  parsePublicApiSearchParams,
  PublicApiNotFoundError,
  publicApiValidationError,
  runAuthenticatedPublicApiRoute,
} from "@/lib/api/handlePublicApiRoute";
import { publicApiDetailQuerySchema } from "@/schemas/api/publicApiSchemas";
import { getPublicApiCategory } from "@/services/publicApiService";

interface CategoryRouteProps {
  readonly params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: CategoryRouteProps): Promise<Response> {
  const { slug } = await params;
  const parsed = publicApiDetailQuerySchema.safeParse(
    Object.fromEntries(parsePublicApiSearchParams(request.url)),
  );

  if (!parsed.success) {
    return publicApiValidationError(parsed.error.errors[0]?.message ?? "Invalid query");
  }

  return runAuthenticatedPublicApiRoute({
    request,
    scope: "read:categories",
    execute: async () => {
      const category = await getPublicApiCategory(slug, parsed.data);

      if (!category) {
        throw new PublicApiNotFoundError("Category");
      }

      return { data: category };
    },
  });
}
