import { expect, test } from "@playwright/test";

import { hasE2eDatabase } from "./helpers/env";

test.describe("Public storefront", () => {
  test.beforeEach(() => {
    test.skip(!hasE2eDatabase, "Set RUN_E2E_DB=true with a live DATABASE_URL to run DB-backed E2E");
  });

  test("localized home page renders catalog sections", async ({ page }) => {
    await page.goto("/uk");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.locator("#products")).toBeVisible();
    await expect(page.locator("#categories")).toBeVisible();
  });

  test("search page accepts query parameter", async ({ page }) => {
    await page.goto("/uk/search?q=demo");
    await expect(page.getByRole("search")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("unknown localized route shows branded 404", async ({ page }) => {
    await page.goto("/uk/this-route-does-not-exist");
    await expect(page.getByRole("heading", { name: /not found|не знайдено/i })).toBeVisible();
  });
});
