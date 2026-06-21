import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Headless SEO CMS</CardTitle>
          <CardDescription>
            Production-grade SEO content management platform. Administration panel and public
            demo site.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild>
            <Link href="/admin">Admin Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/site">Public Site</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
