"use client";

import { useState } from "react";
import { saveLeaseDraft } from "@services/leaseService";

const initialLease = {
  lease_name: "",
  start_date: "",
  end_date: "",
  notice_period_days: 30,
  monthly_rent: "",
  rent_due_date: "",
  rent_frequency: "monthly",
  deposit_amount: "",
  deposit_status: "pending",
  refund_due_date: "",
  refund_timing_notes: ""
};

export default function LeaseFormPage() {
  const [lease, setLease] = useState(initialLease);
  const [message, setMessage] = useState("");

  const handleChange = (field: string, value: string) => {
    setLease((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await saveLeaseDraft(lease);
    setMessage(result?.error ? "Failed to save lease draft." : "Lease draft saved successfully.");
  };

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Lease form</p>
          <h1>Create a lease draft</h1>
          <p className="intro">Enter lease details and save a draft to the Supabase leases table.</p>
        </div>
      </section>

      <section className="card">
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Lease name
            <input value={lease.lease_name} onChange={(e) => handleChange("lease_name", e.target.value)} />
          </label>

          <label>
            Start date
            <input type="date" value={lease.start_date} onChange={(e) => handleChange("start_date", e.target.value)} />
          </label>

          <label>
            End date
            <input type="date" value={lease.end_date} onChange={(e) => handleChange("end_date", e.target.value)} />
          </label>

          <label>
            Notice period (days)
            <input type="number" value={lease.notice_period_days} onChange={(e) => handleChange("notice_period_days", e.target.value)} min={0} />
          </label>

          <label>
            Monthly rent
            <input type="number" value={lease.monthly_rent} onChange={(e) => handleChange("monthly_rent", e.target.value)} min={0} step="0.01" />
          </label>

          <label>
            Rent due date
            <input type="date" value={lease.rent_due_date} onChange={(e) => handleChange("rent_due_date", e.target.value)} />
          </label>

          <label>
            Rent frequency
            <select value={lease.rent_frequency} onChange={(e) => handleChange("rent_frequency", e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="biweekly">Biweekly</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>

          <label>
            Deposit amount
            <input type="number" value={lease.deposit_amount} onChange={(e) => handleChange("deposit_amount", e.target.value)} min={0} step="0.01" />
          </label>

          <label>
            Refund due date
            <input type="date" value={lease.refund_due_date} onChange={(e) => handleChange("refund_due_date", e.target.value)} />
          </label>

          <label className="full-width">
            Refund notes
            <textarea value={lease.refund_timing_notes} onChange={(e) => handleChange("refund_timing_notes", e.target.value)} rows={4} />
          </label>

          <button type="submit" className="primary-button">Save draft</button>
        </form>
        {message && <p className="form-message">{message}</p>}
      </section>
    </div>
  );
}
