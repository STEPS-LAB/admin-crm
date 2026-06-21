import { getClientEnv } from "@/lib/env";

export function buildMediaPublicUrl(bucket: string, storagePath: string): string {
  const { NEXT_PUBLIC_SUPABASE_URL } = getClientEnv();

  return `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;
}
