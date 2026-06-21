import {
  parsePublicApiSearchParams,
  PublicApiNotFoundError,
  publicApiValidationError,
  runAuthenticatedPublicApiRoute,
} from "@/lib/api/handlePublicApiRoute";
import { publicApiDetailQuerySchema } from "@/schemas/api/publicApiSchemas";
import { getPublicApiProduct } from "@/services/publicApiService";

interface ProductRouteProps {
  readonly params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: ProductRouteProps): Promise<Response> {
  const { slug } = await params;
  const parsed = publicApiDetailQuerySchema.safeParse(
    Object.fromEntries(parsePublicApiSearchParams(request.url)),
  );

  if (!parsed.success) {
    return publicApiValidationError(parsed.error.errors[0]?.message ?? "Invalid query");
  }

  return runAuthenticatedPublicApiRoute({
    request,
    scope: "read:products",
    execute: async () => {
      const product = await getPublicApiProduct(slug, parsed.data);

      if (!product) {
        throw new PublicApiNotFoundError("Product");
      }

      return { data: product };
    },
  });
}
