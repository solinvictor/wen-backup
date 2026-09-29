-- Store the Market Day promise and discount that were applied when an order
-- was created. The server remains the source of truth for these values.

alter table public.orders
  add column if not exists market_day text
    check (market_day in ('Tuesday', 'Friday')),
  add column if not exists discount_amount numeric(12, 2) not null default 0,
  add column if not exists expected_delivery_date date;

comment on column public.orders.market_day is
  'Africa/Lagos weekday on which the Market Day offer was applied, if any.';

comment on column public.orders.discount_amount is
  'Discount in naira applied by the server when the order was created.';

comment on column public.orders.expected_delivery_date is
  'Promised delivery date calculated when the order was created.';

drop view if exists public.my_orders;

create view public.my_orders as
  select
    o.id,
    o.order_ref,
    o.product_summary,
    o.delivery_type,
    o.delivery_fee,
    o.market_day,
    o.discount_amount,
    o.expected_delivery_date,
    o.status,
    o.notes,
    o.created_at,
    o.w3w_address,
    o.w3w_lat,
    o.w3w_lng,
    b.full_name,
    b.phone_number,
    b.location as delivery_address,
    b.user_id
  from public.orders o
  join public.buyers b on b.id = o.buyer_id
  where b.user_id = auth.uid();

grant select on public.my_orders to authenticated;