import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";

import { BACKUP_MANIFEST_VERSION, type BackupType } from "@/constants/backup";
import { decryptBackupPayload, encryptBackupPayload } from "@/lib/backup/encryption";

import type { BackupManifest, BackupSnapshotPayload } from "@/types/backup";

export interface SerializedBackupArchive {
  readonly buffer: Buffer;
  readonly checksum: string;
  readonly fileSize: number;
  readonly encrypted: boolean;
  readonly manifestVersion: string;
}

type BackupDataParts = Omit<BackupSnapshotPayload, "manifest">;

function computeChecksum(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function hashDataParts(parts: BackupDataParts): string {
  return computeChecksum(Buffer.from(JSON.stringify(parts), "utf8"));
}

export function buildBackupManifest(input: {
  backupType: BackupType;
  parts: readonly string[];
  payloadChecksum: string;
}): BackupManifest {
  return {
    version: BACKUP_MANIFEST_VERSION,
    generatedAt: new Date().toISOString(),
    backupType: input.backupType,
    parts: input.parts,
    payloadChecksum: input.payloadChecksum,
  };
}

export function serializeBackupSnapshot(
  dataParts: BackupDataParts,
  backupType: BackupType,
  encrypt: boolean,
): SerializedBackupArchive {
  const payloadChecksum = hashDataParts(dataParts);
  const parts = Object.entries(dataParts)
    .filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== null && value !== undefined;
    })
    .map(([key]) => key);

  const manifest = buildBackupManifest({
    backupType,
    parts,
    payloadChecksum,
  });

  const snapshot: BackupSnapshotPayload = {
    manifest,
    ...dataParts,
  };

  const compressed = gzipSync(Buffer.from(JSON.stringify(snapshot), "utf8"));
  const buffer = encrypt ? encryptBackupPayload(compressed) : compressed;

  return {
    buffer,
    checksum: computeChecksum(buffer),
    fileSize: buffer.length,
    encrypted: encrypt,
    manifestVersion: BACKUP_MANIFEST_VERSION,
  };
}

export function parseBackupArchive(buffer: Buffer, encrypted: boolean): BackupSnapshotPayload {
  const decompressed = encrypted ? decryptBackupPayload(buffer) : buffer;
  const json = gunzipSync(decompressed).toString("utf8");
  const payload = JSON.parse(json) as BackupSnapshotPayload;
  const { manifest, ...dataParts } = payload;

  if (hashDataParts(dataParts) !== manifest.payloadChecksum) {
    throw new Error("Backup archive checksum mismatch");
  }

  return payload;
}

export function validateBackupArchiveChecksum(buffer: Buffer, expectedChecksum: string): boolean {
  return computeChecksum(buffer) === expectedChecksum;
}
