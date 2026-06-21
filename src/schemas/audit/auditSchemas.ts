import { z } from "zod";

const auditActions = ["LOGIN", "LOGOUT", "FAILED_LOGIN", "PASSWORD_RESET", "PROFILE_UPDATED"] as const;

const historyEntityTypes = [
  "product",
  "category",
  "seo_profile",
  "metadata",
  "schema",
  "redirect",
  "media",
  "settings",
  "page",
  "brand",
  "system",
] as const;

const historyOperations = [
  "create",
  "update",
  "delete",
  "restore",
  "publish",
  "unpublish",
  "login",
  "logout",
  "import",
  "export",
  "generate",
  "scan",
  "system",
] as const;

export const securityAuditFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().trim().optional(),
  action: z.enum(auditActions).optional(),
});

export const historyAuditFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().trim().optional(),
  entityType: z.enum(historyEntityTypes).optional(),
  operation: z.enum(historyOperations).optional(),
});

export const historyAuditIdSchema = z.object({
  id: z.string().uuid(),
});
