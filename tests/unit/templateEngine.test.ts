import { describe, expect, it } from "vitest";

import { extractTemplateTokens, renderSeoTemplate } from "@/lib/seo/templateEngine";

describe("renderSeoTemplate", () => {
  it("replaces nested variables from context", () => {
    const result = renderSeoTemplate("{{product.name}} — {{site.name}}", {
      product: { name: "Demo product" },
      site: { name: "SEO CMS" },
    });

    expect(result).toBe("Demo product — SEO CMS");
  });

  it("uses fallback when value is empty", () => {
    const result = renderSeoTemplate("{{product.name|Untitled}}", {
      product: { name: "" },
    });

    expect(result).toBe("Untitled");
  });

  it("extracts unique template tokens", () => {
    const tokens = extractTemplateTokens("{{product.name}} — {{site.name}} and {{product.name}}");

    expect(tokens).toEqual(["{{product.name}}", "{{site.name}}"]);
  });
});
