-- Add what3words address fields to orders
alter table public.orders
  add column if not exists w3w_address text,        -- e.g. "filled.count.soap"
  add column if not exists w3w_lat     numeric(10, 7),
  add column if not exists w3w_lng     numeric(10, 7);

-- Add to my_orders view (recreate it)
drop view if exists public.my_orders;

create view public.my_orders as
  select
    o.id,
    o.order_ref,
    o.product_summary,
    o.delivery_type,
    o.delivery_fee,
    o.status,
    o.notes,
    o.created_at,
    o.w3w_address,
    o.w3w_lat,
    o.w3w_lng,
    b.full_name,
    b.phone_number,
    b.location      as delivery_address,
    b.user_id
  from public.orders o
  join public.buyers b on b.id = o.buyer_id
  where b.user_id = auth.uid();

grant select on public.my_orders to authenticated;

-- Rider view: admins can read all orders with location data
-- (already covered by existing admin policy on orders table)
