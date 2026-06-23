import { describe, expect, it } from "vitest";

import { normalizeAdminLocale } from "@/constants/admin-locale";
import { getAdminMessage } from "@/lib/admin/messages";

describe("admin locale", () => {
  it("normalizes supported locale values", () => {
    expect(normalizeAdminLocale("uk")).toBe("uk");
    expect(normalizeAdminLocale("ua")).toBe("uk");
    expect(normalizeAdminLocale("en")).toBe("en");
    expect(normalizeAdminLocale(undefined)).toBe("uk");
  });

  it("returns localized header messages", () => {
    expect(getAdminMessage("uk", "header.signOut")).toBe("Вийти");
    expect(getAdminMessage("en", "header.signOut")).toBe("Sign out");
  });
});
