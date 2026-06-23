"use client";

import { ADMIN_LOCALE_LABELS } from "@/constants/admin-locale";
import { ADMIN_LOCALES } from "@/types/admin-locale";
import { cn } from "@/lib/utils/cn";
import { useAdminLocale } from "@/providers/AdminLocaleProvider";

export function AdminLanguageToggle(): React.JSX.Element {
  const { locale, setLocale, isPending, t } = useAdminLocale();

  return (
    <div
      className="flex rounded-md border border-border/60 p-0.5"
      role="group"
      aria-label={t("header.language")}
    >
      {ADMIN_LOCALES.map((supportedLocale) => (
        <button
          key={supportedLocale}
          type="button"
          className={cn(
            "min-w-[2.25rem] rounded px-2 py-1 text-xs font-semibold transition-colors",
            locale === supportedLocale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setLocale(supportedLocale)}
          disabled={isPending}
          aria-pressed={locale === supportedLocale}
        >
          {ADMIN_LOCALE_LABELS[supportedLocale]}
        </button>
      ))}
    </div>
  );
}
