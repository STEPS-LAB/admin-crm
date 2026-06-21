import Link from "next/link";
import { notFound } from "next/navigation";

import { getSeoProfileAction, listInternalLinksByProfileAction } from "@/actions/seo";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO_OWNER_TYPE_LABELS } from "@/constants/seo";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { ApplySeoTemplatePanel } from "@/features/seo/components/ApplySeoTemplatePanel";
import { InternalLinksPanel } from "@/features/seo/components/InternalLinksPanel";
import { SeoProfileMetadataForm } from "@/features/seo/components/SeoProfileMetadataForm";
import { cn } from "@/lib/utils/cn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{ title: string }> {
  const { id } = await params;
  const profile = await getSeoProfileAction(id);

  return {
    title: profile?.entityLabel ?? "SEO profile",
  };
}

interface SeoProfileDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function SeoProfileDetailPage({
  params,
}: SeoProfileDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const [profile, internalLinks] = await Promise.all([
    getSeoProfileAction(id),
    listInternalLinksByProfileAction(id),
  ]);

  if (!profile) {
    notFound();
  }

  const scoreColors = profile.overallScore !== null ? getSeoScoreColor(profile.overallScore) : null;

  return (
    <>
      <PageHeader
        title={profile.entityLabel}
        description={`${SEO_OWNER_TYPE_LABELS[profile.ownerType]} · ${profile.language.toUpperCase()}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SEO Center", href: "/admin/seo" },
          { label: "Profiles", href: "/admin/seo/profiles" },
          { label: profile.entityLabel },
        ]}
        actions={
          profile.entityHref ? (
            <Button variant="outline" asChild>
              <Link href={profile.entityHref}>Open entity</Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SeoProfileMetadataForm
          profileId={profile.id}
          defaultValues={{
            metaTitle: profile.metaTitle,
            metaDescription: profile.metaDescription,
            index: profile.index,
            follow: profile.follow,
          }}
        />

        <div className="space-y-4">
          <ApplySeoTemplatePanel
            seoProfileId={profile.id}
            ownerType={profile.ownerType}
            language={profile.language}
          />

          <InternalLinksPanel seoProfileId={profile.id} initialLinks={internalLinks} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall score</p>
                {profile.overallScore !== null && scoreColors ? (
                  <p className={cn("text-3xl font-semibold", scoreColors.text)}>{profile.overallScore}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not analyzed yet</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Metadata</p>
                  <p className="font-medium">{profile.metadataScore ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Schema</p>
                  <p className="font-medium">{profile.schemaScore ?? "—"}</p>
                </div>
              </div>
              <Badge variant={profile.isIndexable ? "success" : "secondary"}>
                {profile.isIndexable ? "Indexable" : "Not indexable"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
