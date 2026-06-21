import Link from "next/link";

import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { PUBLIC_API_OPENAPI_PATH } from "@/constants/api";
import { SwaggerApiDocs } from "@/features/api/components/SwaggerApiDocs";

export const metadata = {
  title: "API Documentation",
};

export default function ApiDocsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="API documentation"
        description="Interactive OpenAPI reference for the versioned public REST API"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "API", href: "/admin/api" },
          { label: "Documentation" },
        ]}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={PUBLIC_API_OPENAPI_PATH} target="_blank" rel="noopener noreferrer">
              Download OpenAPI JSON
            </Link>
          </Button>
        }
      />

      <div className="mt-8">
        <SwaggerApiDocs specUrl={PUBLIC_API_OPENAPI_PATH} />
      </div>
    </div>
  );
}
