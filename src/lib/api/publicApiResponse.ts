import { NextResponse } from "next/server";

import type { PublicApiErrorBody, PublicApiSuccessResponse } from "@/types/public-api";

export function publicApiSuccess<T>(
  data: T,
  init?: ResponseInit,
  meta?: PublicApiSuccessResponse<T>["meta"],
): NextResponse<PublicApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    init,
  );
}

export function publicApiError(
  code: string,
  message: string,
  status: number,
  options?: {
    readonly headers?: Record<string, string>;
  },
): NextResponse<PublicApiErrorBody> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    {
      status,
      ...(options?.headers ? { headers: options.headers } : {}),
    },
  );
}
