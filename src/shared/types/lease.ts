export type LeaseType = "property" | "client";

export interface LeaseDeadline {
  id: string;
  lease_type: LeaseType;
  order_id: string;
  entity_id: string;
  start_date: string;
  end_date: string;
  notice_period_days: number;
  notice_deadline: string;
  days_to_deadline: number;
}
