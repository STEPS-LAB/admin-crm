import {
  parsePublicApiSearchParams,
  PublicApiNotFoundError,
  publicApiValidationError,
  runAuthenticatedPublicApiRoute,
} from "@/lib/api/handlePublicApiRoute";
import { publicApiDetailQuerySchema } from "@/schemas/api/publicApiSchemas";
import { getPublicApiBrand } from "@/services/publicApiService";

interface BrandRouteProps {
  readonly params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: BrandRouteProps): Promise<Response> {
  const { slug } = await params;
  const parsed = publicApiDetailQuerySchema.safeParse(
    Object.fromEntries(parsePublicApiSearchParams(request.url)),
  );

  if (!parsed.success) {
    return publicApiValidationError(parsed.error.errors[0]?.message ?? "Invalid query");
  }

  return runAuthenticatedPublicApiRoute({
    request,
    scope: "read:brands",
    execute: async () => {
      const brand = await getPublicApiBrand(slug, parsed.data);

      if (!brand) {
        throw new PublicApiNotFoundError("Brand");
      }

      return { data: brand };
    },
  });
}
