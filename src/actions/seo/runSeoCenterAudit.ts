"use server";

import { revalidatePath } from "next/cache";

import { runSeoCenterAudit } from "@/services/seoAuditService";

import type { ServerActionResult } from "@/types";
import type { SeoAuditResult } from "@/services/seoAuditService";

export async function runSeoCenterAuditAction(): Promise<ServerActionResult<SeoAuditResult>> {
  try {
    const result = await runSeoCenterAudit();
    revalidatePath("/admin/seo");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to run SEO audit",
      code: "AUDIT_FAILED",
    };
  }
}
