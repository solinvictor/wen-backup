-- Add rider_id FK to orders
alter table orders
  add column if not exists rider_id uuid references profiles(id) on delete set null;

-- Index for fast rider lookups
create index if not exists orders_rider_id_idx on orders(rider_id);

-- Drop old delivered_by text column (no longer needed)
-- alter table orders drop column if exists delivered_by;
-- ^ commented out — run manually when you're confident
