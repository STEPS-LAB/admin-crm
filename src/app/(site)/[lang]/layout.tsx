import { notFound } from "next/navigation";

import { isPublicSiteLanguageSegment } from "@/lib/public-site/pathLanguage";

interface PublicSiteLangLayoutProps {
  readonly children: React.ReactNode;
  readonly params: Promise<{ lang: string }>;
}

export default async function PublicSiteLangLayout({
  children,
  params,
}: PublicSiteLangLayoutProps): Promise<React.JSX.Element> {
  const { lang } = await params;

  if (!isPublicSiteLanguageSegment(lang)) {
    notFound();
  }

  return <div lang={lang}>{children}</div>;
}
