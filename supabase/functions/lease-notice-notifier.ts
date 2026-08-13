import { serve } from "std/server";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function queryLeases() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/lease_deadlines?days_to_deadline=eq.0`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    console.error("Failed to query lease deadlines", await res.text());
    return [];
  }

  return res.json();
}

async function sendEmail(lease: any) {
  console.log("Alert lease", lease);
}

serve(async () => {
  const leases = await queryLeases();
  for (const lease of leases) {
    await sendEmail(lease);
  }
  return new Response("ok");
});
