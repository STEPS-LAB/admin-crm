import { describe, expect, it } from "vitest";

import { analyticsFiltersSchema } from "@/schemas/analytics/analyticsSchemas";

describe("analyticsFiltersSchema", () => {
  it("defaults to 30 days when days is omitted", () => {
    const result = analyticsFiltersSchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.days).toBe(30);
    }
  });

  it("accepts supported date ranges", () => {
    for (const days of [7, 30, 90]) {
      const result = analyticsFiltersSchema.safeParse({ days: String(days) });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.days).toBe(days);
      }
    }
  });

  it("rejects unsupported date ranges", () => {
    const result = analyticsFiltersSchema.safeParse({ days: "14" });

    expect(result.success).toBe(false);
  });
});
