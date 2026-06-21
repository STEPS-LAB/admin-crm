export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { getRobotsSummary } from "@/services/sitemapRobotsService";

export async function GET(): Promise<NextResponse> {
  const summary = await getRobotsSummary();

  if (!summary.enabled) {
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }

  return new NextResponse(summary.content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
