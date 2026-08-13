import { supabase } from "@lib/supabaseClient";

export async function fetchDeadlines() {
  const { data, error } = await supabase
    .from("lease_deadlines")
    .select("*")
    .order("days_to_deadline", { ascending: true })
    .limit(50);

  if (error) {
    console.error("Failed to load deadlines", error);
    return [];
  }

  return data || [];
}
