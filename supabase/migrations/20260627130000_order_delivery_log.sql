-- WEN platform — manual delivery logging
-- MVP delivery model: WEN staff handle delivery directly, no rider accounts.
-- This just gives admins a place to record who delivered an order and when,
-- alongside the existing status field.

alter table public.orders
  add column delivered_by text,
  add column delivered_at timestamptz;
