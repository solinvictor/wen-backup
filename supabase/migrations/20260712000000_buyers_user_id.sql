-- Add user_id to buyers so logged-in users' orders can be queried by auth.uid()
-- Nullable so existing rows (placed before auth was added) don't break.

alter table public.buyers
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists buyers_user_id_idx on public.buyers (user_id);

-- Also add delivery_type + delivery_fee to orders (sent from checkout but not stored yet)
alter table public.orders
  add column if not exists delivery_type text check (delivery_type in ('standard', 'express')),
  add column if not exists delivery_fee  integer,
  add column if not exists order_ref     text;

-- RLS: users can read their own orders via buyers.user_id
-- We expose a view so users don't need direct access to buyers table
create or replace view public.my_orders as
  select
    o.id,
    o.order_ref,
    o.product_summary,
    o.delivery_type,
    o.delivery_fee,
    o.status,
    o.notes,
    o.created_at,
    b.full_name,
    b.phone_number,
    b.location      as delivery_address,
    b.user_id
  from public.orders o
  join public.buyers b on b.id = o.buyer_id
  where b.user_id = auth.uid();

-- Grant select on the view to authenticated users
grant select on public.my_orders to authenticated;
