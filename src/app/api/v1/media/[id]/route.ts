import {
  PublicApiNotFoundError,
  runAuthenticatedPublicApiRoute,
} from "@/lib/api/handlePublicApiRoute";
import { getPublicApiMedia } from "@/services/publicApiService";

interface MediaRouteProps {
  readonly params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: MediaRouteProps): Promise<Response> {
  const { id } = await params;

  return runAuthenticatedPublicApiRoute({
    request,
    scope: "read:media",
    execute: async () => {
      const media = await getPublicApiMedia(id);

      if (!media) {
        throw new PublicApiNotFoundError("Media asset");
      }

      return { data: media };
    },
  });
}
