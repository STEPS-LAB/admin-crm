import Link from "next/link";

import { PUBLIC_SITE_SECTIONS } from "@/constants/public-site";

export interface SiteFooterProps {
  readonly siteName: string;
  readonly generatedAt: Date;
}

export function SiteFooter({ siteName, generatedAt }: SiteFooterProps): React.JSX.Element {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="font-medium">{siteName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated {generatedAt.toLocaleString("uk-UA")} from live CMS data.
          </p>
        </div>

        <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground" aria-label="Footer">
          {PUBLIC_SITE_SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="hover:text-foreground">
              {section.label}
            </a>
          ))}
          <Link href="/" className="hover:text-foreground">
            Platform home
          </Link>
          <Link href="/admin" className="hover:text-foreground">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
}
