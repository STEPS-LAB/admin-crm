import { describe, expect, it } from "vitest";

import { notificationListFiltersSchema } from "@/schemas/notifications/notificationSchemas";

describe("notificationListFiltersSchema", () => {
  it("accepts valid filters", () => {
    const result = notificationListFiltersSchema.safeParse({
      page: 1,
      pageSize: 25,
      q: "seo",
      type: "seo",
      status: "unread",
    });

    expect(result.success).toBe(true);
  });

  it("defaults status to all", () => {
    const result = notificationListFiltersSchema.parse({});

    expect(result.status).toBe("all");
    expect(result.pageSize).toBe(25);
  });

  it("rejects invalid notification type", () => {
    const result = notificationListFiltersSchema.safeParse({
      type: "invalid",
    });

    expect(result.success).toBe(false);
  });
});
