-- Switch payment provider from Paystack to Monnify.
--
-- These columns were originally added directly against the remote database
-- rather than through a checked-in migration (see orders.paystack_reference,
-- subscriptions.paystack_email, subscriptions.paystack_authorization_code
-- used throughout the payment routes) — this migration renames them in
-- place rather than dropping/recreating, so existing data is preserved.

alter table public.orders
  rename column paystack_reference to monnify_transaction_reference;

alter table public.subscriptions
  rename column paystack_email to monnify_email;

alter table public.subscriptions
  rename column paystack_authorization_code to monnify_card_token;

-- The Monnify webhook can't rely on custom metadata being echoed back, so it
-- looks up a subscription's pending first payment by this reference instead.
alter table public.subscriptions
  add column if not exists setup_payment_reference text;
