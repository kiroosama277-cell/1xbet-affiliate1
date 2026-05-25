-- Initial database schema for the promo-code sales flow.
-- Designed for PostgreSQL/Supabase-style databases.

create table sales_agents (
  id bigserial primary key,
  name text not null,
  email text unique,
  phone text,
  slug text not null unique,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table promo_requests (
  id bigserial primary key,
  sales_agent_id bigint references sales_agents(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  country text not null,
  proposed_code text not null,
  traffic_source text not null,
  channel_description text,
  page_slug text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'approved', 'rejected', 'contacted')),
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table notifications (
  id bigserial primary key,
  promo_request_id bigint not null references promo_requests(id) on delete cascade,
  sent_to_email text not null,
  notification_type text not null default 'new_request',
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index promo_requests_sales_agent_id_idx on promo_requests(sales_agent_id);
create index promo_requests_status_created_at_idx on promo_requests(status, created_at desc);
create index notifications_request_id_idx on notifications(promo_request_id);
