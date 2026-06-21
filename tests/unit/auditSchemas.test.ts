import { describe, expect, it } from "vitest";

import { historyAuditFiltersSchema, securityAuditFiltersSchema } from "@/schemas/audit/auditSchemas";

describe("securityAuditFiltersSchema", () => {
  it("accepts valid filters", () => {
    const result = securityAuditFiltersSchema.safeParse({
      page: 1,
      pageSize: 25,
      q: "admin",
      action: "LOGIN",
    });

    expect(result.success).toBe(true);
  });
});

describe("historyAuditFiltersSchema", () => {
  it("accepts valid filters", () => {
    const result = historyAuditFiltersSchema.safeParse({
      page: 1,
      pageSize: 25,
      entityType: "settings",
      operation: "update",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid entity type", () => {
    const result = historyAuditFiltersSchema.safeParse({
      entityType: "invalid",
    });

    expect(result.success).toBe(false);
  });
});
