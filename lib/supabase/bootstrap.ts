import { supabase } from "@/lib/supabase/client";

export type SupabaseBootstrapResult =
  | { enabled: false }
  | { enabled: true; userId: string };

export async function bootstrapSupabaseAnon(): Promise<SupabaseBootstrapResult> {
  if (!supabase) return { enabled: false };

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) return { enabled: false };

  let userId = sessionData.session?.user?.id;

  if (!userId) {
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
    if (anonError) return { enabled: false };
    userId = anonData.user?.id;
  }

  if (!userId) return { enabled: false };

  await supabase.from("users").upsert({ id: userId }, { onConflict: "id" });

  try {
    localStorage.setItem("ssx_user_id", userId);
  } catch {}

  return { enabled: true, userId };
}

