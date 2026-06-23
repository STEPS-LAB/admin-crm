import { describe, expect, it } from "vitest";

import { sanitizePublicRichText } from "@/lib/security/sanitizePublicRichText";

describe("sanitizePublicRichText", () => {
  it("preserves allowed markup", () => {
    const html = "<p>Hello <strong>world</strong></p>";

    expect(sanitizePublicRichText(html)).toBe(html);
  });

  it("removes script tags and event handlers", () => {
    const html =
      '<p safe>ok</p><script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(1)">x</a>';

    expect(sanitizePublicRichText(html)).toBe("<p>ok</p><a>x</a>");
  });

  it("strips unsupported tags", () => {
    expect(sanitizePublicRichText("<div><p>Text</p></div>")).toBe("<p>Text</p>");
  });
});
