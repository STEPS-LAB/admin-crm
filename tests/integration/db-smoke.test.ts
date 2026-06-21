import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { getDb } from "@/db/client";
import { products, settings } from "@/db/schema";

const runIntegration = process.env.RUN_INTEGRATION_TESTS === "true";

describe.skipIf(!runIntegration)("database integration smoke test", () => {
  it("reads seeded settings row", async () => {
    const db = getDb();
    const rows = await db.select().from(settings).limit(1);

    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0]?.siteName).toBeTruthy();
  });

  it("reads demo product when seeded", async () => {
    const db = getDb();
    const demoProductId = "00000000-0000-4000-8000-000000000020";
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.id, demoProductId))
      .limit(1);

    expect(rows.length).toBe(1);
    expect(rows[0]?.sku).toBe("DEMO-001");
  });
});
