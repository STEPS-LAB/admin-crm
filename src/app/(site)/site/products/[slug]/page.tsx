import { redirectLegacySiteEntity } from "@/lib/public-site/legacyRedirects";

export const dynamic = "force-dynamic";

interface LegacyProductRedirectProps {
  readonly params: Promise<{ slug: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LegacyProductRedirect({
  params,
  searchParams,
}: LegacyProductRedirectProps): Promise<never> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return redirectLegacySiteEntity("products", slug, query);
}
