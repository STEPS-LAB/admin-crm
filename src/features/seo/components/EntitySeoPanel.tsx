"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeoProfileMetadataForm } from "@/features/seo/components/SeoProfileMetadataForm";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { cn } from "@/lib/utils/cn";

import type { EntitySeoProfiles, SeoProfileDetail } from "@/types/seo-center";

export interface EntitySeoPanelProps {
  readonly profiles: EntitySeoProfiles;
}

function SeoProfileAnalysisCard({ profile }: { readonly profile: SeoProfileDetail }): React.JSX.Element {
  const scoreColors = profile.overallScore !== null ? getSeoScoreColor(profile.overallScore) : null;

  return (
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
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/admin/seo/profiles/${profile.id}`}>
            Advanced SEO settings
            <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function EntitySeoPanel({ profiles }: EntitySeoPanelProps): React.JSX.Element {
  const languageProfiles = {
    uk: profiles.uk,
    en: profiles.en,
  } as const;

  return (
    <Tabs defaultValue="uk">
      <TabsList>
        <TabsTrigger value="uk">Ukrainian</TabsTrigger>
        <TabsTrigger value="en">English</TabsTrigger>
      </TabsList>

      {(["uk", "en"] as const).map((language) => {
        const profile = languageProfiles[language];

        return (
          <TabsContent key={language} value={language} className="mt-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <SeoProfileMetadataForm
                profileId={profile.id}
                defaultValues={{
                  metaTitle: profile.metaTitle,
                  metaDescription: profile.metaDescription,
                  index: profile.index,
                  follow: profile.follow,
                }}
              />
              <SeoProfileAnalysisCard profile={profile} />
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
