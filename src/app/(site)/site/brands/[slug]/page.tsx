import { redirectLegacySiteEntity } from "@/lib/public-site/legacyRedirects";

export const dynamic = "force-dynamic";

interface LegacyBrandRedirectProps {
  readonly params: Promise<{ slug: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LegacyBrandRedirect({
  params,
  searchParams,
}: LegacyBrandRedirectProps): Promise<never> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return redirectLegacySiteEntity("brands", slug, query);
}
