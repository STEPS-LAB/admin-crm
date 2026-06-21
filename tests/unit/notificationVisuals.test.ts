import { describe, expect, it } from "vitest";

import {
  getNotificationPriorityLabel,
  getNotificationVisualStyle,
} from "@/features/notifications/utils/notificationVisuals";

describe("notificationVisuals", () => {
  it("maps error notifications to critical priority", () => {
    expect(getNotificationPriorityLabel("error", null)).toBe("Critical");
    expect(getNotificationVisualStyle("error").badgeVariant).toBe("destructive");
  });

  it("uses metadata priority when provided", () => {
    expect(getNotificationPriorityLabel("info", { priority: "high" })).toBe("High");
  });
});
