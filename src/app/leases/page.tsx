import React from "react";
import { supabase } from "@lib/supabaseClient";

export default async function LeasesPage() {
  const { data, error } = await supabase.from("leases").select("id, lease_name, start_date, end_date, monthly_rent, status, created_at").order("created_at", { ascending: false }).limit(50);

  if (error) {
    return (
      <section className="card">
        <h2>Leases</h2>
        <p>Error loading leases: {error.message}</p>
      </section>
    );
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <section className="card">
      <h2>Saved leases (drafts)</h2>
      {rows.length === 0 && <p>No leases found.</p>}
      {rows.map((r: any) => (
        <div key={r.id} style={{ marginBottom: 12 }}>
          <strong>{r.lease_name || "(no name)"}</strong>
          <div>Start: {r.start_date ?? "-"} — End: {r.end_date ?? "-"}</div>
          <div>Rent: {r.monthly_rent ?? "-"} — Status: {r.status}</div>
          <div style={{ fontSize: 12, color: "#666" }}>Created: {new Date(r.created_at).toLocaleString()}</div>
        </div>
      ))}
    </section>
  );
}
