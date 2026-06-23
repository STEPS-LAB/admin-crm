"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { PUBLIC_SITE_LANGUAGE_LABELS } from "@/constants/public-site";
import { SiteSearchForm } from "@/features/public-site/components/SiteSearchForm";
import { getPublicSiteMessage, getPublicSiteSections } from "@/lib/public-site/messages";
import { isPublicSiteHomePath, replaceLanguageInPathname } from "@/lib/public-site/pathLanguage";
import { buildPublicSiteHomeHref } from "@/lib/public-site/paths";
import { cn } from "@/lib/utils/cn";

import type { PublicSiteLanguage } from "@/types/public-site";

export interface SiteHeaderProps {
  readonly siteName: string;
  readonly language: PublicSiteLanguage;
  readonly supportedLanguages: readonly PublicSiteLanguage[];
  readonly languageSwitcherEnabled: boolean;
}

export function SiteHeader({
  siteName,
  language,
  supportedLanguages,
  languageSwitcherEnabled,
}: SiteHeaderProps): React.JSX.Element {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const sections = getPublicSiteSections(language);

  const switchLanguage = (nextLanguage: PublicSiteLanguage): void => {
    if (nextLanguage === language || isPending) {
      return;
    }

    const nextPath = replaceLanguageInPathname(pathname, nextLanguage);
    const destination = isPublicSiteHomePath(pathname) ? `${nextPath}#hero` : nextPath;

    startTransition(() => {
      window.location.assign(destination);
    });
  };

  return (
    <header className="border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-6">
        <Link
          href={`${buildPublicSiteHomeHref(language)}#hero`}
          className="truncate text-sm font-semibold tracking-tight"
        >
          {siteName}
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 md:flex"
          aria-label={getPublicSiteMessage(language, "header.sections")}
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <SiteSearchForm key={language} language={language} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {languageSwitcherEnabled && supportedLanguages.length > 1 ? (
            <div
              className="flex rounded-md border p-0.5"
              role="group"
              aria-label={getPublicSiteMessage(language, "header.language")}
            >
              {supportedLanguages.map((supportedLanguage) => (
                <button
                  key={supportedLanguage}
                  type="button"
                  className={cn(
                    "rounded px-2 py-1 text-xs font-medium transition-colors",
                    language === supportedLanguage
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => switchLanguage(supportedLanguage)}
                  disabled={isPending}
                  aria-pressed={language === supportedLanguage}
                >
                  {PUBLIC_SITE_LANGUAGE_LABELS[supportedLanguage]}
                </button>
              ))}
            </div>
          ) : null}

          <Button variant="outline" size="sm" asChild>
            <Link href="/admin" prefetch={false}>
              {getPublicSiteMessage(language, "common.admin")}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
