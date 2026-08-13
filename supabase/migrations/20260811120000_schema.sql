create extension if not exists "uuid-ossp";

create table operators (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default uuid_generate_v4(),
  operator_id uuid not null references operators(id),
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default uuid_generate_v4(),
  operator_id uuid not null references operators(id),
  address text not null,
  unit text,
  city text,
  state text,
  zip text,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  operator_id uuid not null references operators(id),
  client_id uuid not null references clients(id),
  order_name text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table leases (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  client_id uuid references clients(id),
  property_id uuid references properties(id),
  lease_name text,
  start_date date not null,
  end_date date not null,
  notice_period_days int not null default 30,
  monthly_rent numeric(12,2),
  rent_due_date date,
  rent_frequency text default 'monthly',
  deposit_amount numeric(12,2),
  deposit_status text default 'pending',
  refund_due_date date,
  refund_timing_notes text,
  status text default 'active',
  created_at timestamptz not null default now()
);

create view lease_deadlines as
select
  id,
  lease_name,
  order_id,
  client_id as entity_id,
  property_id,
  start_date,
  end_date,
  notice_period_days,
  end_date - notice_period_days * interval '1 day' as notice_deadline,
  greatest((end_date - notice_period_days * interval '1 day')::date - current_date, 0) as days_to_deadline,
  'lease' as lease_type
from leases;

create table lease_uploads (
  id uuid primary key default uuid_generate_v4(),
  lease_type text not null,
  file_name text not null,
  storage_path text not null,
  extracted_path text not null,
  status text not null default 'processed',
  extracted_count int not null default 0,
  created_at timestamptz not null default now()
);
