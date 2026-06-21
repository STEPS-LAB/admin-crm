"use server";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { getRobotsSummary, updateRobotsConfiguration, validateRobots } from "@/services/sitemapRobotsService";
import { robotsConfigSchema } from "@/schemas/seo/robotsSchemas";

import type { ServerActionResult } from "@/types";
import type { RobotsConfigInput, RobotsSummary } from "@/types/sitemap-robots";

function parseRobotsForm(formData: FormData) {
  const sitemapUrlsRaw = formData.get("sitemapUrls");

  const sitemapUrls =
    typeof sitemapUrlsRaw === "string"
      ? sitemapUrlsRaw
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
      : [];

  return robotsConfigSchema.safeParse({
    userAgent: formData.get("userAgent"),
    allowRules: formData.get("allowRules") || null,
    disallowRules: formData.get("disallowRules") || null,
    host: formData.get("host") || null,
    sitemapUrls,
    customDirectives: formData.get("customDirectives") || null,
    isActive: formData.get("isActive") === "true",
  });
}

export async function getRobotsSummaryAction(): Promise<RobotsSummary> {
  return getRobotsSummary();
}

export async function updateRobotsAction(
  _prevState: ServerActionResult<RobotsSummary> | null,
  formData: FormData,
): Promise<ServerActionResult<RobotsSummary>> {
  const parsed = parseRobotsForm(formData);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await updateRobotsConfiguration(parsed.data, context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update robots.txt",
      code: "UPDATE_FAILED",
    };
  }
}

export async function validateRobotsAction(
  input: RobotsConfigInput,
  siteUrl: string,
): Promise<ServerActionResult<{ valid: boolean; issues: RobotsSummary["validation"]["issues"] }>> {
  const parsed = robotsConfigSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid robots configuration", code: "VALIDATION_ERROR" };
  }

  const result = validateRobots(parsed.data, siteUrl);

  return {
    success: true,
    data: result,
  };
}
