import { NextResponse } from "next/server";

import { isCronRequestAuthorized } from "@/lib/internal/cronAuth";
import { processDueWebhookDeliveries } from "@/services/webhookService";

export async function GET(request: Request): Promise<NextResponse> {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Valid cron authorization required",
        },
      },
      { status: 401 },
    );
  }

  try {
    const processed = await processDueWebhookDeliveries();

    return NextResponse.json({
      success: true,
      data: {
        processed,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CRON_FAILED",
          message: error instanceof Error ? error.message : "Webhook cron failed",
        },
      },
      { status: 500 },
    );
  }
}
