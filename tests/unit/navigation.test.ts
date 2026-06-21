import { describe, expect, it } from "vitest";

import { isNavItemActive } from "@/constants/navigation";

describe("isNavItemActive", () => {
  it("matches dashboard only on exact /admin path", () => {
    expect(isNavItemActive("/admin", "/admin")).toBe(true);
    expect(isNavItemActive("/admin/products", "/admin")).toBe(false);
  });

  it("matches nested module routes", () => {
    expect(isNavItemActive("/admin/products", "/admin/products")).toBe(true);
    expect(isNavItemActive("/admin/products/new", "/admin/products")).toBe(true);
    expect(isNavItemActive("/admin/seo", "/admin/products")).toBe(false);
  });
});
