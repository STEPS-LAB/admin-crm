"use server";

import { sendTestEmail } from "@/services/emailService";
import { sendTestEmailSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SendTestEmailResult } from "@/services/emailService";

export async function sendTestEmailAction(
  recipient: string,
): Promise<ServerActionResult<SendTestEmailResult>> {
  const parsed = sendTestEmailSchema.safeParse({ recipient });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid recipient";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const result = await sendTestEmail(parsed.data.recipient);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send test email",
      code: "SEND_FAILED",
    };
  }
}
