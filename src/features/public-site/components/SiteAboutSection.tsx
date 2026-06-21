import { RichTextContent } from "@/features/public-site/components/RichTextContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { PublicSiteHomepageContent } from "@/types/public-site";

export interface SiteAboutSectionProps {
  readonly siteName: string;
  readonly siteDescription: string | null;
  readonly homepage: PublicSiteHomepageContent | null;
}

export function SiteAboutSection({
  siteName,
  siteDescription,
  homepage,
}: SiteAboutSectionProps): React.JSX.Element {
  const title = homepage?.title ?? `About ${siteName}`;
  const fallback = siteDescription ?? "Content managed through the Pages module in the administration panel.";

  return (
    <section id="about" className="scroll-mt-24 border-t bg-muted/20 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Story</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">About</h2>
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
