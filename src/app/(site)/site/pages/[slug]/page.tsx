import { redirectLegacySiteEntity } from "@/lib/public-site/legacyRedirects";

export const dynamic = "force-dynamic";

interface LegacyPageRedirectProps {
  readonly params: Promise<{ slug: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LegacyPageRedirect({
  params,
  searchParams,
}: LegacyPageRedirectProps): Promise<never> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return redirectLegacySiteEntity("pages", slug, query);
}
