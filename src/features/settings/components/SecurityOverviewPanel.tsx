import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SECURITY_LEVEL_DESCRIPTIONS, SECURITY_LEVEL_LABELS } from "@/constants/security-settings";
import { resolveLoginRateLimitPolicy } from "@/lib/security/securityPolicy";

import type { SettingsRecord } from "@/types/settings";

export interface SecurityOverviewPanelProps {
  readonly settings: SettingsRecord;
}

export function SecurityOverviewPanel({ settings }: SecurityOverviewPanelProps): React.JSX.Element {
  const loginPolicy = resolveLoginRateLimitPolicy(settings);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active security policy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{SECURITY_LEVEL_LABELS[settings.securityLevel]}</Badge>
          <Badge variant={loginPolicy.enabled ? "success" : "secondary"}>
            {loginPolicy.enabled ? "Login lockout enabled" : "Login lockout disabled"}
          </Badge>
          {settings.ipAllowList.length > 0 ? (
            <Badge variant="warning">{settings.ipAllowList.length} allowed IPs</Badge>
          ) : null}
          {settings.ipBlockList.length > 0 ? (
            <Badge variant="destructive">{settings.ipBlockList.length} blocked IPs</Badge>
          ) : null}
        </div>

        <p className="text-sm text-muted-foreground">
          {SECURITY_LEVEL_DESCRIPTIONS[settings.securityLevel]}
        </p>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Session idle timeout</dt>
            <dd className="font-medium">{settings.sessionIdleTimeoutHours}h</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Absolute session lifetime</dt>
            <dd className="font-medium">{settings.sessionAbsoluteLifetimeHours}h</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Login attempts</dt>
            <dd className="font-medium">
              {loginPolicy.enabled
                ? `${settings.loginMaxAttempts} / ${settings.loginLockoutWindowMinutes} min`
                : "Unlimited"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Settings save rate</dt>
            <dd className="font-medium">{settings.rateLimitSettingsPerMinute}/min</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Public API rate</dt>
            <dd className="font-medium">{settings.rateLimitApiPerMinute}/min</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Admin search rate</dt>
            <dd className="font-medium">{settings.rateLimitSearchPerMinute}/min</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Import rate</dt>
            <dd className="font-medium">{settings.rateLimitImportPerMinute}/min</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Export rate</dt>
            <dd className="font-medium">{settings.rateLimitExportPerMinute}/min</dd>
          </div>
        </dl>

        <Link href="/admin/audit/security" className="text-sm text-primary hover:underline">
          View security audit log
        </Link>
      </CardContent>
    </Card>
  );
}
