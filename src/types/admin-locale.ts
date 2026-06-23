export const ADMIN_LOCALES = ["uk", "en"] as const;

export type AdminLocale = (typeof ADMIN_LOCALES)[number];
