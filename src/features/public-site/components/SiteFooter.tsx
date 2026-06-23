import Link from "next/link";

import {
  getPublicSiteLocale,
  getPublicSiteMessage,
  getPublicSiteSections,
} from "@/lib/public-site/messages";

import type { PublicSiteLanguage } from "@/types/public-site";

export interface SiteFooterProps {
  readonly siteName: string;
  readonly generatedAt: Date;
  readonly language: PublicSiteLanguage;
}

export function SiteFooter({
  siteName,
  generatedAt,
  language,
}: SiteFooterProps): React.JSX.Element {
  const formattedDate = generatedAt.toLocaleString(getPublicSiteLocale(language));

  return (
    <footer className="bg-muted/30 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="font-medium">{siteName}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {getPublicSiteMessage(language, "footer.generated", { date: formattedDate })}
          </p>
        </div>

        <nav className="text-muted-foreground flex flex-wrap gap-4 text-sm" aria-label="Footer">
          {getPublicSiteSections(language).map((section) => (
            <a key={section.id} href={`#${section.id}`} className="hover:text-foreground">
              {section.label}
            </a>
          ))}
          <Link href="/" className="hover:text-foreground">
            {getPublicSiteMessage(language, "common.platformHome")}
          </Link>
          <Link href="/admin" className="hover:text-foreground">
            {getPublicSiteMessage(language, "common.admin")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
