import { fetchOrders } from "@services/orderService";

export default async function OrdersPage() {
  const orders = await fetchOrders();

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Orders</p>
          <h1>Current orders</h1>
          <p className="intro">Browse active orders and click any order to see lease details.</p>
        </div>
      </section>

      <section className="card-list">
        {orders.length === 0 ? (
          <div className="card">No orders found yet.</div>
        ) : (
          orders.map((order: any) => (
            <a key={order.id} href={`/order/${order.id}`} className="card order-card">
              <div>
                <p className="card-title">{order.order_name || `Order ${order.id}`}</p>
                <p className="card-subtitle">Client: {order.client?.name || "Unknown"}</p>
              </div>
              <div className="status-pill">{order.status || "pending"}</div>
            </a>
          ))
        )}
      </section>
    </div>
  );
}
