"use server";

import { headers } from "next/headers";

import { loginSchema } from "@/schemas/authentication/loginSchema";
import { authenticate } from "@/services/authenticationService";
import { extractRequestMetadata } from "@/lib/security/requestMetadata";
import { setAdminSessionCookies } from "@/lib/security/sessionCookies";

import type { ServerActionResult } from "@/types";
import type { AuthUser } from "@/types/auth";

export async function loginAction(
  _prevState: ServerActionResult<AuthUser> | null,
  formData: FormData,
): Promise<ServerActionResult<AuthUser>> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe") === "on" || formData.get("rememberMe") === "true",
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  const headersList = await headers();
  const metadata = extractRequestMetadata(headersList);

  const result = await authenticate(parsed.data, metadata);

  if (!result.success) {
    return { success: false, error: result.error, code: result.code };
  }

  await setAdminSessionCookies(result.sessionId, result.rememberMe);

  return { success: true, data: result.user };
}
