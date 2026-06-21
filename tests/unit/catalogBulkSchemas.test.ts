import { describe, expect, it } from "vitest";

import {
  bulkEntityIdsSchema,
  bulkProductStatusSchema,
  reorderCategoriesSchema,
} from "@/schemas/catalog/bulkSchemas";

describe("catalog bulk schemas", () => {
  it("accepts valid product bulk status payload", () => {
    const result = bulkProductStatusSchema.safeParse({
      ids: ["550e8400-e29b-41d4-a716-446655440000"],
      status: "published",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty id list", () => {
    const result = bulkEntityIdsSchema.safeParse({ ids: [] });
    expect(result.success).toBe(false);
  });

  it("accepts category reorder payload", () => {
    const result = reorderCategoriesSchema.safeParse({
      parentId: null,
      orderedIds: [
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001",
      ],
    });

    expect(result.success).toBe(true);
  });
});
