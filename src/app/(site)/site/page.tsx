import { redirectLegacySiteHome } from "@/lib/public-site/legacyRedirects";

export const dynamic = "force-dynamic";

interface LegacySiteHomeRedirectProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LegacySiteHomeRedirect({
  searchParams,
}: LegacySiteHomeRedirectProps): Promise<never> {
  const params = await searchParams;
  return redirectLegacySiteHome(params);
}
