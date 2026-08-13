"use client";

import { useMemo, useState } from "react";

interface DeadlineItem {
  id: string;
  lease_type: string;
  order_id: string;
  notice_deadline: string;
  days_to_deadline: number;
}

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Owner leases", value: "owner" },
  { label: "Customer leases", value: "customer" }
];

export default function RenewalSchedule({ deadlines }: { deadlines: DeadlineItem[] }) {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredDeadlines = useMemo(() => {
    if (selectedFilter === "all") {
      return deadlines;
    }

    const expectedType = selectedFilter === "owner" ? "property" : "client";
    return deadlines.filter((lease) => lease.lease_type === expectedType);
  }, [deadlines, selectedFilter]);

  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <h2>Detailed renewal schedule</h2>
          <p className="section-description">
            Filter the renewal schedule by owner or customer leases.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`filter-button ${selectedFilter === filter.value ? "filter-active" : ""}`}
            onClick={() => setSelectedFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredDeadlines.length === 0 ? (
        <p>No records match the selected lease type.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Order</th>
              <th>Deadline</th>
              <th>Days left</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeadlines.map((lease) => (
              <tr
                key={`${lease.lease_type}-${lease.id}`}
                className={lease.days_to_deadline <= 7 ? "row-urgent" : ""}
              >
                <td>{lease.lease_type || "Lease"}</td>
                <td>{lease.order_id || "—"}</td>
                <td>{new Date(lease.notice_deadline).toLocaleDateString()}</td>
                <td>{lease.days_to_deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
