"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";

import { updateAdminLocaleAction } from "@/actions/profile/updateLocale";
import { ADMIN_LOCALE_HTML_LANG, normalizeAdminLocale } from "@/constants/admin-locale";
import { getAdminMessage } from "@/lib/admin/messages";

import type { AdminMessageKey } from "@/lib/admin/messages";
import type { AdminLocale } from "@/types/admin-locale";

interface AdminLocaleContextValue {
  readonly locale: AdminLocale;
  readonly isPending: boolean;
  readonly setLocale: (locale: AdminLocale) => void;
  readonly t: (key: AdminMessageKey) => string;
}

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null);

function applyDocumentLocale(locale: AdminLocale): void {
  document.documentElement.lang = ADMIN_LOCALE_HTML_LANG[locale];
}

export interface AdminLocaleProviderProps {
  readonly initialLocale: string;
  readonly children: React.ReactNode;
}

export function AdminLocaleProvider({
  initialLocale,
  children,
}: AdminLocaleProviderProps): React.JSX.Element {
  const [locale, setLocaleState] = useState<AdminLocale>(() => normalizeAdminLocale(initialLocale));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocaleState(normalizeAdminLocale(initialLocale));
  }, [initialLocale]);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: AdminLocale) => {
    if (nextLocale === locale) {
      return;
    }

    setLocaleState(nextLocale);
    applyDocumentLocale(nextLocale);

    startTransition(() => {
      void updateAdminLocaleAction(nextLocale);
    });
  }, [locale]);

  const t = useCallback((key: AdminMessageKey) => getAdminMessage(locale, key), [locale]);

  const value = useMemo(
    () => ({
      locale,
      isPending,
      setLocale,
      t,
    }),
    [locale, isPending, setLocale, t],
  );

  return <AdminLocaleContext.Provider value={value}>{children}</AdminLocaleContext.Provider>;
}

export function useAdminLocale(): AdminLocaleContextValue {
  const context = useContext(AdminLocaleContext);

  if (!context) {
    throw new Error("useAdminLocale must be used within AdminLocaleProvider");
  }

  return context;
}
