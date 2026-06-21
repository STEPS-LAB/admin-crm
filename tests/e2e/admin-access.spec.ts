import { expect, test } from "@playwright/test";

const protectedAdminRoutes = [
  "/admin/products",
  "/admin/seo",
  "/admin/api",
  "/admin/import",
  "/admin/settings",
];

test.describe("Admin access guards", () => {
  for (const route of protectedAdminRoutes) {
    test(`redirects unauthenticated users from ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/admin\/login/);
    });
  }

  test("shows session expired message on login page", async ({ page }) => {
    await page.goto("/admin/login?error=session_expired");
    await expect(page.getByText(/session expired/i)).toBeVisible();
  });
});
