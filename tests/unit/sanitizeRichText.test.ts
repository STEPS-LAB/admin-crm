import { describe, expect, it } from "vitest";

import {
  isEmptyRichText,
  normalizeRichTextValue,
  toEditorHtml,
} from "@/lib/security/richText";
import { sanitizeRichTextInput, sanitizeRichText } from "@/lib/security/sanitizeRichText";

describe("sanitizeRichText", () => {
  it("allows safe formatting tags", () => {
    const html = "<p>Hello <strong>world</strong></p>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("strips script tags", () => {
    const html = '<p>Safe</p><script>alert("xss")</script>';
    expect(sanitizeRichText(html)).toBe("<p>Safe</p>");
  });

  it("strips unsafe attributes from links", () => {
    const html = '<a href="https://example.com" onclick="alert(1)">Link</a>';
    expect(sanitizeRichText(html)).toBe('<a href="https://example.com">Link</a>');
  });

  it("normalizes empty editor output to null", () => {
    expect(normalizeRichTextValue("<p></p>")).toBeNull();
    expect(normalizeRichTextValue("<p><br></p>")).toBeNull();
    expect(normalizeRichTextValue("")).toBeNull();
  });

  it("sanitizes persisted rich text on the server", () => {
    const html = '<p>Safe</p><script>alert("xss")</script>';
    expect(sanitizeRichTextInput(html)).toBe("<p>Safe</p>");
  });

  it("detects empty rich text values", () => {
    expect(isEmptyRichText(null)).toBe(true);
    expect(isEmptyRichText("<p></p>")).toBe(true);
    expect(isEmptyRichText("<p>Content</p>")).toBe(false);
  });

  it("wraps legacy plain text for the editor", () => {
    expect(toEditorHtml("Plain text")).toBe("<p>Plain text</p>");
    expect(toEditorHtml("<p>Already HTML</p>")).toBe("<p>Already HTML</p>");
  });
});
