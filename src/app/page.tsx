import { fetchDeadlines } from "@services/deadlineService";
import LeaseUpload from "@components/LeaseUpload";
import RenewalSchedule from "@components/RenewalSchedule";
import { supabase } from "@lib/supabaseClient";
import AskRenewButton from "@components/AskRenewButton";

async function LeaseList() {
  const { data, error } = await supabase
    .from("leases")
    .select(
      `id, lease_name, start_date, end_date, notice_period_days, deposit_amount, status, client:client_id(name), property:property_id(address)`
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return <p>Error loading leases: {error.message}</p>;
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <div>
      {rows.length === 0 && <p>No leases found.</p>}
        {rows.map((r: any) => {
        const clientName = r.client?.name ?? "-";
        const address = r.property?.address ?? "-";
        const startDate = r.start_date ? new Date(r.start_date).toLocaleDateString() : "-";
        const endDate = r.end_date ? new Date(r.end_date).toLocaleDateString() : "-";
        const noticeToVacate = r.end_date && typeof r.notice_period_days === "number"
          ? new Date(new Date(r.end_date).getTime() - r.notice_period_days * 24 * 60 * 60 * 1000).toLocaleDateString()
          : "-";
        const deposit = r.deposit_amount != null ? `${r.deposit_amount}` : "-";
        const daysUntilEnd = r.end_date ? Math.ceil((new Date(r.end_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : null;

        return (
          <div key={r.id} style={{ marginBottom: 12 }}>
            <strong>{r.lease_name || "(no name)"}</strong>
            <div>Client: {clientName}</div>
            <div>Address: {address}</div>
            <div>Start: {startDate} — End: {endDate}</div>
            <div>
              Renew?: {daysUntilEnd !== null && daysUntilEnd <= 60 ? (
                <AskRenewButton clientName={clientName} address={address} endDate={endDate} />
              ) : (
                daysUntilEnd === null ? "-" : "No"
              )}
            </div>
            <div>Notice to vacate: {noticeToVacate}</div>
            <div>Security deposit: {deposit}</div>
          </div>
        );
      })}
    </div>
  );
}

export default async function HomePage() {
  const deadlines = await fetchDeadlines();
  const total = deadlines.length;
  const overdue = deadlines.filter((item: any) => item.days_to_deadline <= 0).length;
  const urgent = deadlines.filter((item: any) => item.days_to_deadline > 0 && item.days_to_deadline <= 7).length;
  const upcoming = deadlines.filter((item: any) => item.days_to_deadline > 7 && item.days_to_deadline <= 30).length;

  const categories = [
    { label: "Overdue", items: deadlines.filter((item: any) => item.days_to_deadline <= 0) },
    { label: "Next 7 days", items: deadlines.filter((item: any) => item.days_to_deadline > 0 && item.days_to_deadline <= 7) },
    { label: "Next 30 days", items: deadlines.filter((item: any) => item.days_to_deadline > 7 && item.days_to_deadline <= 30) },
    { label: "Later", items: deadlines.filter((item: any) => item.days_to_deadline > 30) }
  ];

  return (
    <div className="page-shell">
      <section className="hero">
        <div className="hero-copy-block">
          <p className="eyebrow">Internal dashboard</p>
          <h1>Lease Management</h1>
          <p className="intro">
            Track all units, renewal status, and upload owner or customer lease files from one place.
          </p>
        </div>

        <div className="hero-stat-grid">
          <div className="hero-stat-card">
            <p className="hero-stat-value">{total}</p>
            <p className="hero-stat-label">Total units</p>
          </div>
          <div className="hero-stat-card hero-stat-urgent">
            <p className="hero-stat-value">{overdue}</p>
            <p className="hero-stat-label">Overdue renewals</p>
          </div>
          <div className="hero-stat-card">
            <p className="hero-stat-value">{urgent}</p>
            <p className="hero-stat-label">Next 7 days</p>
          </div>
          <div className="hero-stat-card">
            <p className="hero-stat-value">{upcoming}</p>
            <p className="hero-stat-label">Next 30 days</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>All Leases</h2>
            <p className="section-description">Latest leases with extracted fields from uploaded documents.</p>
          </div>
        </div>

        <LeaseList />
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Renewal status</h2>
            <p className="section-description">Renewals are spread across multiple windows; focus on the urgent units first.</p>
          </div>
        </div>

        {deadlines.length === 0 ? (
          <p>No lease renewal data available.</p>
        ) : (
          <div className="summary-grid">
            {categories.map((group) => (
              <div key={group.label} className="summary-card renewal-card">
                <p className="summary-label">{group.label}</p>
                <p className="summary-value">{group.items.length}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <RenewalSchedule deadlines={deadlines} />

      <LeaseUpload />
    </div>
  );
}
