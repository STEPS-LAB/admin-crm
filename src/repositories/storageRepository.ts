import { createAdminClient } from "@/lib/supabase/admin";
import { BACKUP_STORAGE_BUCKET } from "@/constants/backup";
import { MAX_MEDIA_UPLOAD_BYTES } from "@/constants/media";

export interface UploadObjectInput {
  readonly bucket: string;
  readonly path: string;
  readonly buffer: Buffer;
  readonly contentType: string;
  readonly upsert?: boolean;
}

export async function ensureBucketExists(bucket: string, options?: { public?: boolean }): Promise<void> {
  const supabase = createAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Failed to list storage buckets: ${listError.message}`);
  }

  if (buckets?.some((item) => item.name === bucket)) {
    return;
  }

  const { error } = await supabase.storage.createBucket(bucket, {
    public: options?.public ?? true,
    fileSizeLimit: MAX_MEDIA_UPLOAD_BYTES,
  });

  if (error) {
    throw new Error(`Failed to create storage bucket: ${error.message}`);
  }
}

export async function ensureBackupBucketExists(): Promise<void> {
  await ensureBucketExists("backups", { public: false });
}

export async function uploadObject(input: UploadObjectInput): Promise<void> {
  const supabase = createAdminClient();

  await ensureBucketExists(input.bucket, {
    public: input.bucket !== BACKUP_STORAGE_BUCKET,
  });

  const { error } = await supabase.storage.from(input.bucket).upload(input.path, input.buffer, {
    contentType: input.contentType,
    upsert: input.upsert ?? false,
  });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }
}

export async function removeObject(bucket: string, path: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}

export async function downloadObject(bucket: string, path: string): Promise<Buffer> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw new Error(`Storage download failed: ${error.message}`);
  }

  if (!data) {
    throw new Error("Storage download returned empty payload");
  }

  return Buffer.from(await data.arrayBuffer());
}
