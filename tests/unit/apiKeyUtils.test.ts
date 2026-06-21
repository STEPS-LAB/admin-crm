import { describe, expect, it } from "vitest";

import { API_KEY_PREFIX } from "@/constants/api";
import { generateApiKey, hashApiKey } from "@/lib/api/apiKeys";
import { maskApiKey } from "@/lib/api/maskApiKey";

describe("api key utilities", () => {
  it("generates keys with the expected prefix", () => {
    const generated = generateApiKey();

    expect(generated.fullKey.startsWith(API_KEY_PREFIX)).toBe(true);
    expect(generated.prefix).toBe(generated.fullKey.slice(0, 12));
    expect(generated.hash).toBe(hashApiKey(generated.fullKey));
  });

  it("hashes keys deterministically", () => {
    const key = "cms_live_example-token";

    expect(hashApiKey(key)).toBe(hashApiKey(key));
    expect(hashApiKey(key)).not.toBe(key);
  });

  it("masks keys for display", () => {
    expect(maskApiKey("cms_live_ab")).toBe("cms_live_ab••••••••••••••••");
  });
});
