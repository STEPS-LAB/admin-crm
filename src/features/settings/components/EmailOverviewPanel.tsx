import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SMTP_ENCRYPTION_LABELS } from "@/constants/email-settings";

import type { SettingsRecord } from "@/types/settings";

export interface EmailOverviewPanelProps {
  readonly settings: SettingsRecord;
  readonly hasStoredPassword: boolean;
}

export function EmailOverviewPanel({
  settings,
  hasStoredPassword,
}: EmailOverviewPanelProps): React.JSX.Element {
  const configured = Boolean(settings.smtpHost && settings.emailSenderAddress);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Email delivery status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={configured ? "success" : "secondary"}>
            {configured ? "SMTP configured" : "Not configured"}
          </Badge>
          {hasStoredPassword ? <Badge variant="outline">Password stored</Badge> : null}
          {settings.smtpEncryption ? (
            <Badge variant="outline">
              {SMTP_ENCRYPTION_LABELS[settings.smtpEncryption]}
            </Badge>
          ) : null}
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">SMTP host</dt>
            <dd className="font-medium">{settings.smtpHost ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Port</dt>
            <dd className="font-medium">{settings.smtpPort}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Sender</dt>
            <dd className="font-medium">
              {settings.emailSenderName
                ? `${settings.emailSenderName} <${settings.emailSenderAddress ?? ""}>`
                : (settings.emailSenderAddress ?? "—")}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Reply-to</dt>
            <dd className="font-medium">{settings.emailReplyTo ?? "—"}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
