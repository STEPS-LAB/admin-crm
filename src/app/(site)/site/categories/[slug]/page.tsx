import { redirectLegacySiteEntity } from "@/lib/public-site/legacyRedirects";

export const dynamic = "force-dynamic";

interface LegacyCategoryRedirectProps {
  readonly params: Promise<{ slug: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LegacyCategoryRedirect({
  params,
  searchParams,
}: LegacyCategoryRedirectProps): Promise<never> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return redirectLegacySiteEntity("categories", slug, query);
}
