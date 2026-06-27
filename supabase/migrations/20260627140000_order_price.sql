-- WEN platform — order pricing for revenue tracking
-- Revenue = sum of order value (price), not a WEN commission/fee — that's a
-- pricing-model decision not yet made. This gives Reports something real
-- and honest to sum without guessing at a take-rate.

alter table public.orders
  add column price numeric(12, 2);

comment on column public.orders.price is
  'Total order value in naira. Nullable — may be unset while an order is still pending and a price hasn''t been agreed yet.';
