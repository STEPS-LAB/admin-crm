import { buildPublicApiOpenApiDocument } from "@/lib/api/openapi/buildPublicApiOpenApiDocument";
import { getSettings } from "@/services/settingsService";

export async function GET(): Promise<Response> {
  const settings = await getSettings();
  const document = buildPublicApiOpenApiDocument({ siteUrl: settings.siteUrl });

  return Response.json(document, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
