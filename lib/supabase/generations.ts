import { supabase } from "./client";

export interface Generation {
  id?: string;
  user_id: string;
  template_id: string;
  template_name: string;
  name: string;
  event: string;
  image_url?: string;
  caption?: string;
  created_at?: string;
}

/**
 * Save a generation to Supabase.
 * Falls back silently if Supabase is not configured.
 */
export async function saveGeneration(gen: Generation) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("generations")
    .insert(gen)
    .select()
    .single();
  if (error) { console.error("saveGeneration:", error.message); return null; }
  return data;
}

/**
 * List all generations for a user.
 */
export async function listGenerations(userId: string): Promise<Generation[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error("listGenerations:", error.message); return []; }
  return data ?? [];
}

/**
 * Delete a generation by ID.
 */
export async function deleteGeneration(id: string) {
  if (!supabase) return;
  await supabase.from("generations").delete().eq("id", id);
}
