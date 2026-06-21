import { NextResponse } from "next/server";

import { getIpAccessPolicy } from "@/services/ipAccessService";

export async function GET(): Promise<NextResponse> {
  const policy = await getIpAccessPolicy();

  return NextResponse.json(policy, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
    },
  });
}
