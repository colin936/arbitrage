import { fetchDeadlines } from "@services/deadlineService";
import LeaseUpload from "@components/LeaseUpload";
import RenewalSchedule from "@components/RenewalSchedule";

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
