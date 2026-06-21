import { runAuthenticatedPublicApiRoute } from "@/lib/api/handlePublicApiRoute";
import { getPublicApiSettings } from "@/services/publicApiService";

export async function GET(request: Request): Promise<Response> {
  return runAuthenticatedPublicApiRoute({
    request,
    scope: "read:settings",
    execute: async () => ({
      data: await getPublicApiSettings(),
    }),
  });
}
