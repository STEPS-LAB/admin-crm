import { getRobotsSummaryAction } from "@/actions/seo";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { RobotsBuilder } from "@/features/seo/components/RobotsBuilder";

export const metadata = {
  title: "Robots.txt",
};

export default async function SeoRobotsPage(): Promise<React.JSX.Element> {
  const summary = await getRobotsSummaryAction();

  return (
    <>
      <PageHeader
        title="Robots.txt"
        description="Visual builder for crawl rules and sitemap references"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SEO Center", href: "/admin/seo" },
          { label: "Robots" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
              View live file
            </a>
          </Button>
        }
      />

      <div className="mt-8">
        <RobotsBuilder summary={summary} />
      </div>
    </>
  );
}
