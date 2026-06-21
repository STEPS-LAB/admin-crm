import type { PublicSiteLanguage } from "@/types/public-site";
import type { SettingsRecord } from "@/types/settings";

export function resolvePublicSiteLanguage(
  requested: string | undefined,
  defaultLanguage: PublicSiteLanguage,
  supportedLanguages: readonly PublicSiteLanguage[],
  fallbackLanguage?: PublicSiteLanguage,
): PublicSiteLanguage {
  if (requested === "uk" || requested === "en") {
    if (supportedLanguages.includes(requested)) {
      return requested;
    }

    if (fallbackLanguage && supportedLanguages.includes(fallbackLanguage)) {
      return fallbackLanguage;
    }
  }

  return supportedLanguages.includes(defaultLanguage) ? defaultLanguage : "uk";
}

export function getSupportedPublicLanguages(
  settings: SettingsRecord,
): PublicSiteLanguage[] {
  const supported = settings.supportedLanguages.filter(
    (language): language is PublicSiteLanguage => language === "uk" || language === "en",
  );

  return supported.length > 0 ? supported : ["uk", "en"];
}

export function resolvePublicSiteLanguageFromSettings(
  requested: string | undefined,
  settings: SettingsRecord,
): PublicSiteLanguage {
  const supportedLanguages = getSupportedPublicLanguages(settings);
  const defaultLanguage: PublicSiteLanguage = settings.defaultLanguage === "en" ? "en" : "uk";

  return resolvePublicSiteLanguage(
    requested,
    defaultLanguage,
    supportedLanguages,
    settings.fallbackLanguage,
  );
}
