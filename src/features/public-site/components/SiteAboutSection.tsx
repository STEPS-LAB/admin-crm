import { RichTextContent } from "@/features/public-site/components/RichTextContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicSiteMessage } from "@/lib/public-site/messages";

import type { PublicSiteHomepageContent, PublicSiteLanguage } from "@/types/public-site";

export interface SiteAboutSectionProps {
  readonly siteName: string;
  readonly siteDescription: string | null;
  readonly homepage: PublicSiteHomepageContent | null;
  readonly language: PublicSiteLanguage;
}

export function SiteAboutSection({
  siteName,
  siteDescription,
  homepage,
  language,
}: SiteAboutSectionProps): React.JSX.Element {
  const title =
    homepage?.title ?? getPublicSiteMessage(language, "about.defaultTitle", { siteName });
  const fallback = siteDescription ?? getPublicSiteMessage(language, "about.fallback");

  return (
    <section id="about" className="bg-muted/20 scroll-mt-24 border-t py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8">
          <p className="text-primary text-sm font-medium">
            {getPublicSiteMessage(language, "about.eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {getPublicSiteMessage(language, "about.title")}
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            {homepage?.content ? (
              <RichTextContent html={homepage.content} />
            ) : (
              <p className="text-muted-foreground">{homepage?.excerpt ?? fallback}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
