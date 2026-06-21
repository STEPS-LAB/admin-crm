"use client";

import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { generateSitemapAction } from "@/actions/seo/getSitemapSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO_OWNER_TYPE_LABELS } from "@/constants/seo";

import type { SitemapSummary } from "@/types/sitemap-robots";

export interface SitemapManagerProps {
  readonly summary: SitemapSummary;
}

function downloadXml(xml: string): void {
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "sitemap.xml";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SitemapManager({ summary }: SitemapManagerProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [previewXml, setPreviewXml] = useState<string | null>(null);

  const runGenerate = (): void => {
    startTransition(async () => {
      try {
        const result = await generateSitemapAction();
        setPreviewXml(result.xml);
        toast.success(`Sitemap generated with ${result.summary.indexedUrls} URLs`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to generate sitemap");
      }
    });
  };

  const previewEntries = summary.entries.slice(0, 50);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total URLs</CardDescription>
            <CardTitle className="text-3xl">{summary.totalUrls}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {summary.indexedUrls} indexed · {summary.excludedUrls} excluded · {summary.hiddenUrls} noindex
          </CardContent>
        </Card>

        {summary.typeStats.map((stat) => (
          <Card key={stat.ownerType}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.indexed}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {stat.total} total · {stat.excluded} excluded
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Sitemap status</CardTitle>
            <CardDescription>
              Public URL:{" "}
              <a href={summary.sitemapUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {summary.sitemapUrl}
              </a>
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={summary.enabled ? "success" : "secondary"}>
              {summary.enabled ? "Enabled" : "Disabled"}
            </Badge>
            <Badge variant="outline">{summary.autoGenerate ? "Auto-generate" : "Manual"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={runGenerate} disabled={isPending || !summary.enabled}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Regenerate sitemap
          </Button>
          {previewXml ? (
            <Button variant="outline" onClick={() => downloadXml(previewXml)}>
              <Download className="mr-2 h-4 w-4" />
              Download XML
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/admin/settings/seo">Sitemap settings</Link>
          </Button>
          <p className="w-full text-xs text-muted-foreground">
            Last calculated {format(summary.generatedAt, "d MMM yyyy, HH:mm", { locale: uk })}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="entries">
        <TabsList>
          <TabsTrigger value="entries">URL preview</TabsTrigger>
          <TabsTrigger value="xml">XML preview</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Indexed URLs</CardTitle>
              <CardDescription>
                Showing {previewEntries.length} of {summary.entries.length} discovered URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {previewEntries.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No published content found. Publish products, categories, pages, or brands to populate the sitemap.
                </p>
              ) : (
                <div className="overflow-hidden rounded-b-lg border-t">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewEntries.map((entry) => (
                        <TableRow key={`${entry.ownerId}-${entry.language}`}>
                          <TableCell>
                            <div className="space-y-0.5">
                              <span className="font-medium">{entry.label}</span>
                              <span className="block text-xs text-muted-foreground">
                                {SEO_OWNER_TYPE_LABELS[entry.ownerType]} · {entry.language.toUpperCase()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {entry.loc}
                          </TableCell>
                          <TableCell>
                            {entry.excluded ? (
                              <Badge variant="warning">Excluded</Badge>
                            ) : entry.indexed ? (
                              <Badge variant="success">Indexed</Badge>
                            ) : (
                              <Badge variant="secondary">Noindex</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{entry.priority}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="xml" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">XML output</CardTitle>
              <CardDescription>Generate the sitemap to preview XML output</CardDescription>
            </CardHeader>
            <CardContent>
              {previewXml ? (
                <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed">
                  {previewXml}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click &quot;Regenerate sitemap&quot; to preview the XML document.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
