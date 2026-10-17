-- Switch payment provider from Paystack to Monnify.
--
-- These columns were originally added directly against the remote database
-- rather than through a checked-in migration (see orders.paystack_reference,
-- subscriptions.paystack_email, subscriptions.paystack_authorization_code
-- used throughout the payment routes) — this migration renames them in
-- place rather than dropping/recreating, so existing data is preserved.
--
-- Conditional: on the real production database the old paystack_* columns
-- exist, so this renames them (preserving data). On a fresh database built
-- from this migrations folder, 20260627125000_subscriptions.sql already
-- creates the table with the monnify_* names directly — the old columns
-- never existed — so each rename is skipped as a no-op rather than failing.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'paystack_reference'
  ) then
    alter table public.orders
      rename column paystack_reference to monnify_transaction_reference;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'subscriptions' and column_name = 'paystack_email'
  ) then
    alter table public.subscriptions
      rename column paystack_email to monnify_email;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'subscriptions' and column_name = 'paystack_authorization_code'
  ) then
    alter table public.subscriptions
      rename column paystack_authorization_code to monnify_card_token;
  end if;
end $$;

-- The Monnify webhook can't rely on custom metadata being echoed back, so it
-- looks up a subscription's pending first payment by this reference instead.
alter table public.subscriptions
  add column if not exists setup_payment_reference text;

-- orders.amount_total is a second undocumented column from the same
-- payment-flow build — every payment route and src/app/api/orders/route.ts
-- (order creation) reads/writes it, computed server-side, never migrated.
-- Distinct from orders.price (20260627140000_order_price.sql), which is
-- unused by the payment code and appears to be an earlier, separate field.
alter table public.orders
  add column if not exists amount_total numeric(12, 2);
