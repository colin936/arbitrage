import { fetchOrder } from "@services/orderService";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const order = await fetchOrder(params.id);

  if (!order) {
    return <div className="page-shell">Order not found</div>;
  }

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Order</p>
          <h1>{order.order_name || `Order ${order.id}`}</h1>
          <p className="intro">Details for the selected order and its associated leases.</p>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <h2>Order overview</h2>
        </div>
        <div className="detail-grid">
          <div>
            <p className="detail-label">Status</p>
            <p>{order.status || "Unknown"}</p>
          </div>
          <div>
            <p className="detail-label">Client</p>
            <p>{order.client?.name || "Unknown client"}</p>
            <p>{order.client?.email || "No email"}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <h2>Leases</h2>
        </div>
        {order.leases?.length ? (
          order.leases.map((lease: any) => (
            <div key={lease.id} className="lease-summary-card">
              <div>
                <p className="card-title">{lease.lease_name || "Lease"}</p>
                <p>{lease.start_date} → {lease.end_date}</p>
              </div>
              <div>
                <p className="detail-label">Rent</p>
                <p>${lease.monthly_rent || "0.00"} / month</p>
              </div>
              <div>
                <p className="detail-label">Deposit</p>
                <p>${lease.deposit_amount || "0.00"}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No leases are attached to this order yet.</p>
        )}
      </section>
    </div>
  );
}
