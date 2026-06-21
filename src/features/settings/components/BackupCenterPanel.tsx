"use client";

import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import {
  Database,
  HardDrive,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteBackupAction,
  executeRestoreAction,
  previewRestoreAction,
  protectBackupAction,
  runFullBackupAction,
  runMetadataBackupAction,
  validateBackupAction,
} from "@/actions/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RESTORE_SCOPES, RESTORE_SCOPE_LABELS } from "@/constants/backup";

import type { BackupOverview, BackupRecordSummary, RestorePreviewResult } from "@/types/backup";

export interface BackupCenterPanelProps {
  readonly overview: BackupOverview;
  readonly records: readonly BackupRecordSummary[];
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) {
    return "—";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusVariant(
  status: BackupRecordSummary["status"],
): "success" | "destructive" | "outline" | "secondary" {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "destructive";
    case "in_progress":
      return "outline";
    default:
      return "secondary";
  }
}

export function BackupCenterPanel({
  overview,
  records,
}: BackupCenterPanelProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<RestorePreviewResult["scopes"][number]["scope"][]>(
    [...RESTORE_SCOPES],
  );
  const [preview, setPreview] = useState<RestorePreviewResult | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const runAction = (action: () => Promise<{ success: boolean; error?: string }>): void => {
    startTransition(async () => {
      const result = await action();

      if (result.success) {
        router.refresh();
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  const openRestore = (backupId: string): void => {
    setRestoreBackupId(backupId);
    setPreview(null);
    setSelectedScopes([...RESTORE_SCOPES]);
  };

  const closeRestore = (): void => {
    setRestoreBackupId(null);
    setPreview(null);
    setIsPreviewLoading(false);
  };

  const loadPreview = (): void => {
    if (!restoreBackupId) {
      return;
    }

    setIsPreviewLoading(true);
    startTransition(async () => {
      const result = await previewRestoreAction(restoreBackupId, selectedScopes);

      if (result.success) {
        setPreview(result.data);
      } else {
        toast.error(result.error);
      }

      setIsPreviewLoading(false);
    });
  };

  const confirmRestore = (): void => {
    if (!restoreBackupId) {
      return;
    }

    startTransition(async () => {
      const result = await executeRestoreAction(restoreBackupId, selectedScopes);

      if (result.success) {
        toast.success("Restore completed");
        closeRestore();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup center</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Latest backup</dt>
              <dd className="font-medium">
                {overview.latestBackup
                  ? formatDistanceToNow(overview.latestBackup.createdAt, {
                      addSuffix: true,
                      locale: uk,
                    })
                  : "Never"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Completed</dt>
              <dd className="font-medium">{overview.completedCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Storage used</dt>
              <dd className="font-medium">{formatFileSize(overview.totalStorageBytes)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Schedule</dt>
              <dd className="font-medium">
                {overview.scheduleEnabled
                  ? `Daily at ${overview.scheduleHourUtc}:00 UTC`
                  : "Manual only"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                runAction(async () => {
                  const result = await runMetadataBackupAction();
                  if (result.success) {
                    toast.success("Metadata backup completed");
                  }
                  return result;
                })
              }
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Database className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="ml-2">Metadata backup</span>
            </Button>

            <Button
              type="button"
              disabled={isPending}
              onClick={() =>
                runAction(async () => {
                  const result = await runFullBackupAction();
                  if (result.success) {
                    toast.success("Full backup completed");
                  }
                  return result;
                })
              }
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <HardDrive className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="ml-2">Full backup</span>
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">History</p>
            {records.length === 0 ? (
              <p className="text-sm text-muted-foreground">No backups have been created yet.</p>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {record.backupType === "full" ? "Full backup" : "Metadata snapshot"}
                      {record.isProtected ? " · protected" : null}
                    </p>
                    <p className="text-muted-foreground">
                      {formatDistanceToNow(record.createdAt, { addSuffix: true, locale: uk })}
                      {record.triggeredBy === "pre_restore" ? " · safety backup" : null}
                    </p>
                    {record.errorMessage ? (
                      <p className="text-xs text-destructive">{record.errorMessage}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground">{formatFileSize(record.fileSize)}</span>
                    <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
                    <Badge variant="outline">{record.validationStatus}</Badge>

                    {record.status === "completed" ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() =>
                            runAction(async () => {
                              const result = await validateBackupAction(record.id);
                              if (result.success) {
                                toast.success(`Validation: ${result.data.status}`);
                              }
                              return result;
                            })
                          }
                        >
                          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isPending || record.backupType !== "full"}
                          onClick={() => openRestore(record.id)}
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          <span className="ml-2">Restore</span>
                        </Button>
                      </>
                    ) : null}

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isPending || record.isProtected}
                      onClick={() =>
                        runAction(async () => {
                          const result = await protectBackupAction(record.id, !record.isProtected);
                          if (result.success) {
                            toast.message(record.isProtected ? "Backup unprotected" : "Backup protected");
                          }
                          return result;
                        })
                      }
                    >
                      {record.isProtected ? "Unpin" : "Pin"}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isPending || record.isProtected}
                      onClick={() =>
                        runAction(async () => {
                          const result = await deleteBackupAction(record.id);
                          if (result.success) {
                            toast.success("Backup deleted");
                          }
                          return result;
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={restoreBackupId !== null} onOpenChange={(open) => !open && closeRestore()}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Restore backup</DialogTitle>
            <DialogDescription>
              A safety backup is created automatically before any restore runs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              {RESTORE_SCOPES.map((scope) => (
                <div key={scope} className="flex items-center gap-2">
                  <Checkbox
                    id={`restore-${scope}`}
                    checked={selectedScopes.includes(scope)}
                    onCheckedChange={(checked) => {
                      setSelectedScopes((current) =>
                        checked
                          ? [...current, scope]
                          : current.filter((value) => value !== scope),
                      );
                      setPreview(null);
                    }}
                  />
                  <Label htmlFor={`restore-${scope}`}>{RESTORE_SCOPE_LABELS[scope]}</Label>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isPending || isPreviewLoading || selectedScopes.length === 0}
              onClick={loadPreview}
            >
              {isPreviewLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              <span className="ml-2">Dry run preview</span>
            </Button>

            {preview ? (
              <div className="space-y-2 rounded-lg border p-3 text-sm">
                {preview.scopes.map((scope) => (
                  <div key={scope.scope}>
                    <p className="font-medium">{scope.label}</p>
                    <p className="text-muted-foreground">
                      create {scope.willCreate} · update {scope.willUpdate} · skip {scope.willSkip}
                    </p>
                    {scope.warnings.map((warning) => (
                      <p key={warning} className="text-xs text-destructive">
                        {warning}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeRestore}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending || !preview?.canRestore}
              onClick={confirmRestore}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              <span className="ml-2">Restore</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
