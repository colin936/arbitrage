import React from "react";

export default function Navigation() {
  return (
    <nav className="top-nav">
      <div className="nav-brand">Altruva</div>
      <div className="nav-links">
        <a href="/">Deadlines</a>
        <a href="/orders">Orders</a>
        <a href="/lease-form">Lease Form</a>
      </div>
    </nav>
  );
}
