export const SETTINGS_SECTIONS = [
  { id: "general", label: "General", href: "/admin/settings" },
  { id: "seo", label: "SEO", href: "/admin/settings/seo" },
  { id: "appearance", label: "Appearance", href: "/admin/settings/appearance" },
  { id: "integrations", label: "Integrations", href: "/admin/settings/integrations" },
  { id: "storage", label: "Storage", href: "/admin/settings/storage" },
  { id: "email", label: "Email", href: "/admin/settings/email" },
  { id: "cache", label: "Cache", href: "/admin/settings/cache" },
  { id: "system", label: "System", href: "/admin/settings/system" },
  { id: "localization", label: "Localization", href: "/admin/settings/localization" },
  { id: "security", label: "Security", href: "/admin/settings/security" },
  { id: "advanced", label: "Advanced", href: "/admin/settings/advanced" },
] as const;

export const SUPPORTED_LANGUAGES = ["uk", "en"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  uk: "Ukrainian",
  en: "English",
};

export const TIMEZONE_OPTIONS = [
  "Europe/Kyiv",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Warsaw",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
] as const;

export const CURRENCY_OPTIONS = ["UAH", "USD", "EUR", "GBP", "PLN"] as const;

export const TWITTER_CARD_OPTIONS = [
  "summary",
  "summary_large_image",
] as const;

export const SITEMAP_FREQUENCY_OPTIONS = [
  "hourly",
  "daily",
  "weekly",
  "monthly",
] as const;

export const THEME_OPTIONS = ["light", "dark", "system"] as const;

export const LAYOUT_DENSITY_OPTIONS = ["compact", "comfortable"] as const;

export const BORDER_RADIUS_OPTIONS = [4, 6, 8, 10, 12] as const;
