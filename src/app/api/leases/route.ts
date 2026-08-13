import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic mapping — adjust according to your leases schema
    const payload = {
      lease_name: body.lease_name ?? body.invoice_number ?? null,
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
      notice_period_days: body.notice_period_days ?? null,
      monthly_rent: body.monthly_rent ?? body.total ?? null,
      rent_due_date: body.rent_due_date ?? null,
      rent_frequency: body.rent_frequency ?? null,
      deposit_amount: body.deposit_amount ?? null,
      deposit_status: body.deposit_status ?? null,
      refund_due_date: body.refund_due_date ?? null,
      refund_timing_notes: body.refund_timing_notes ?? null,
      order_id: body.order_id ?? null,
      client_id: body.client_id ?? null,
      property_id: body.property_id ?? null,
    };

    const { data, error } = await supabase.from("leases").insert([payload]).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
