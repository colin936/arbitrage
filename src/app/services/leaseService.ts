import { supabase } from "@lib/supabaseClient";

export async function saveLeaseDraft(lease: any) {
  const payload = {
    lease_name: lease.lease_name,
    start_date: lease.start_date,
    end_date: lease.end_date,
    notice_period_days: Number(lease.notice_period_days),
    monthly_rent: Number(lease.monthly_rent),
    rent_due_date: lease.rent_due_date,
    rent_frequency: lease.rent_frequency,
    deposit_amount: Number(lease.deposit_amount),
    deposit_status: lease.deposit_status,
    refund_due_date: lease.refund_due_date,
    refund_timing_notes: lease.refund_timing_notes,
    order_id: null,
    client_id: null,
    property_id: null
  };

  const { data, error } = await supabase.from("leases").insert([payload]);

  if (error) {
    console.error("Failed to save lease draft", error);
    return { error };
  }

  return { data };
}
