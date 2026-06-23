import type { AdminLocale } from "@/types/admin-locale";

export const ADMIN_LOCALE_LABELS: Record<AdminLocale, string> = {
  uk: "UA",
  en: "EN",
};

export const ADMIN_LOCALE_HTML_LANG: Record<AdminLocale, string> = {
  uk: "uk",
  en: "en",
};

export function normalizeAdminLocale(value: string | null | undefined): AdminLocale {
  if (value === "en") {
    return "en";
  }

  if (value === "uk" || value === "ua") {
    return "uk";
  }

  return "uk";
}
