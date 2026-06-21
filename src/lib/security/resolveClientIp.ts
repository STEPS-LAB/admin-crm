import type { NextRequest } from "next/server";

export function resolveClientIp(request: NextRequest | Headers): string | null {
  const headers = request instanceof Headers ? request : request.headers;
  const forwarded = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");

  return forwarded?.split(",")[0]?.trim() ?? realIp ?? null;
}
