import { createBrowserClient } from "@supabase/ssr";

import { getClientEnv } from "@/lib/env";

import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient {
  const env = getClientEnv();
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
