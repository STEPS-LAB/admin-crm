import { FeatureFlagCard } from "@/features/settings/components/FeatureFlagCard";

import type { FeatureFlagCenterOverview, FeatureFlagListItem } from "@/types/feature-flags";

export interface FeatureFlagsPanelProps {
  readonly overview: FeatureFlagCenterOverview;
  readonly flags: FeatureFlagListItem[];
}

export function FeatureFlagsPanel({
  overview,
  flags,
}: FeatureFlagsPanelProps): React.JSX.Element {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Feature flags</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle experimental functionality without redeploying. {overview.enabledCount} of{" "}
          {overview.totalFlags} flags enabled.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {flags.map((flag) => (
          <FeatureFlagCard key={flag.slug} flag={flag} />
        ))}
      </div>
    </section>
  );
}
