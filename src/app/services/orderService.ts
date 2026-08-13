import { supabase } from "@lib/supabaseClient";

export async function fetchOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, clients(*), leases(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to load orders", error);
    return [];
  }

  return data || [];
}

export async function fetchOrder(orderId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, clients(*), leases(*)")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Failed to load order", error);
    return null;
  }

  return data;
}
