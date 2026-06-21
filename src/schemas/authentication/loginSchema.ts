import { z } from "zod";

import { DEV_TEST_USER } from "@/constants/devTestUser";

const isProduction = process.env.NODE_ENV === "production";
const passwordMinLength = isProduction ? 8 : 4;

function normalizeLoginEmail(value: string): string {
  const trimmed = value.trim();

  if (!isProduction && trimmed.toLowerCase() === DEV_TEST_USER.loginAlias) {
    return DEV_TEST_USER.email;
  }

  return trimmed;
}

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Enter your email or username")
    .transform(normalizeLoginEmail)
    .pipe(z.string().email("Enter a valid email address").max(254)),
  password: z
    .string()
    .min(passwordMinLength, `Password must be at least ${passwordMinLength} characters`)
    .max(128, "Password must be at most 128 characters"),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
