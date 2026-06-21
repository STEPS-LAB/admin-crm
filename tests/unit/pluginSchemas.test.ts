import { describe, expect, it } from "vitest";

import { BUNDLED_PLUGINS, PLUGIN_TYPES } from "@/constants/plugins";
import { pluginListFiltersSchema, togglePluginSchema } from "@/schemas/plugins/pluginSchemas";

describe("pluginListFiltersSchema", () => {
  it("accepts empty filters", () => {
    const result = pluginListFiltersSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts valid plugin type filter", () => {
    const result = pluginListFiltersSchema.safeParse({ type: "seo_extensions" });
    expect(result.success).toBe(true);
  });

  it("rejects unknown plugin type", () => {
    const result = pluginListFiltersSchema.safeParse({ type: "unknown" });
    expect(result.success).toBe(false);
  });
});

describe("togglePluginSchema", () => {
  it("accepts valid toggle payload", () => {
    const result = togglePluginSchema.safeParse({
      slug: "seo-automation",
      enabled: false,
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty slug", () => {
    const result = togglePluginSchema.safeParse({
      slug: "",
      enabled: true,
    });

    expect(result.success).toBe(false);
  });
});

describe("bundled plugin registry", () => {
  it("contains unique slugs", () => {
    const slugs = BUNDLED_PLUGINS.map((plugin) => plugin.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses known plugin types only", () => {
    const allowed = new Set(PLUGIN_TYPES);

    for (const plugin of BUNDLED_PLUGINS) {
      expect(allowed.has(plugin.type)).toBe(true);
    }
  });
});
