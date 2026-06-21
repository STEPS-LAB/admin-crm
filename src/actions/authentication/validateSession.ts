"use server";

import { createClient } from "@/lib/supabase/server";

export async function validateSessionAction(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return Boolean(data.user);
}
