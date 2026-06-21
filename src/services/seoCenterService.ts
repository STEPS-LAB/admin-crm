import { getSeoCenterOverview } from "@/repositories/seoCenterRepository";

import type { SeoCenterOverview } from "@/types/seo-center";

export async function getOverview(): Promise<SeoCenterOverview> {
  return getSeoCenterOverview();
}
