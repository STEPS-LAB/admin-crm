import { expect, test } from "@playwright/test";

test.describe("Application smoke", () => {
  test("marketing home page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Headless SEO CMS" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Public Site" })).toBeVisible();
  });

  test("login page renders accessible form", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "SEO CMS" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("protected admin route redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("admin API docs route requires authentication", async ({ page }) => {
    await page.goto("/admin/api/docs");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
