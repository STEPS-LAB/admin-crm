import {
  parsePublicApiSearchParams,
  PublicApiNotFoundError,
  publicApiValidationError,
  runAuthenticatedPublicApiRoute,
} from "@/lib/api/handlePublicApiRoute";
import { publicApiDetailQuerySchema } from "@/schemas/api/publicApiSchemas";
import { getPublicApiPage } from "@/services/publicApiService";

interface PageRouteProps {
  readonly params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: PageRouteProps): Promise<Response> {
  const { slug } = await params;
  const parsed = publicApiDetailQuerySchema.safeParse(
    Object.fromEntries(parsePublicApiSearchParams(request.url)),
  );

  if (!parsed.success) {
    return publicApiValidationError(parsed.error.errors[0]?.message ?? "Invalid query");
  }

  return runAuthenticatedPublicApiRoute({
    request,
    scope: "read:pages",
    execute: async () => {
      const page = await getPublicApiPage(slug, parsed.data);

      if (!page) {
        throw new PublicApiNotFoundError("Page");
      }

      return { data: page };
    },
  });
}
