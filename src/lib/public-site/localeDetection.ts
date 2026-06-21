import type { PublicSiteLanguage } from "@/types/public-site";
import type { SettingsRecord } from "@/types/settings";

export function parseAcceptLanguageHeader(
  header: string | null,
): PublicSiteLanguage | null {
  if (!header) {
    return null;
  }

  const tokens = header
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const token of tokens) {
    if (!token) {
      continue;
    }

    if (token === "uk" || token === "ua" || token.startsWith("uk-")) {
      return "uk";
    }

    if (token === "en" || token.startsWith("en-")) {
      return "en";
    }
  }

  return null;
}

export function resolveDetectedPublicLanguage(
  settings: SettingsRecord,
  acceptLanguage: string | null,
): PublicSiteLanguage {
  if (settings.automaticLocaleDetection && settings.browserLanguageDetection) {
    const detected = parseAcceptLanguageHeader(acceptLanguage);

    if (detected && settings.supportedLanguages.includes(detected)) {
      return detected;
    }
  }

  return settings.defaultLanguage;
}
