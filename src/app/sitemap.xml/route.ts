export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { generateSitemap } from "@/services/sitemapRobotsService";
import { getSettings } from "@/services/settingsService";

export async function GET(): Promise<NextResponse> {
  const settings = await getSettings();

  if (!settings.sitemapEnabled) {
    return new NextResponse("Sitemap is disabled", { status: 404 });
  }

  const { xml } = await generateSitemap();

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
