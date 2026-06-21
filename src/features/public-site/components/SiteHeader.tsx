"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  PUBLIC_SITE_LANGUAGE_LABELS,
  PUBLIC_SITE_SECTIONS,
} from "@/constants/public-site";
import { SiteSearchForm } from "@/features/public-site/components/SiteSearchForm";
import { replaceLanguageInPathname } from "@/lib/public-site/pathLanguage";
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
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLanguage = (nextLanguage: PublicSiteLanguage): void => {
    const nextPath = replaceLanguageInPathname(pathname, nextLanguage);

    startTransition(() => {
      router.replace(`${nextPath}#hero`);
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-6">
        <Link
          href={`${buildPublicSiteHomeHref(language)}#hero`}
          className="truncate text-sm font-semibold tracking-tight"
        >
          {siteName}
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Page sections">
          {PUBLIC_SITE_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <SiteSearchForm language={language} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {languageSwitcherEnabled && supportedLanguages.length > 1 ? (
            <div className="flex rounded-md border p-0.5" role="group" aria-label="Language">
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
            <Link href="/admin">Admin</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
