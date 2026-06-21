import { NextResponse } from "next/server";

import { isCronRequestAuthorized } from "@/lib/internal/cronAuth";
import { runScheduledBackupIfDue } from "@/services/backupService";

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
    const result = await runScheduledBackupIfDue();

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CRON_FAILED",
          message: error instanceof Error ? error.message : "Backup cron failed",
        },
      },
      { status: 500 },
    );
  }
}
