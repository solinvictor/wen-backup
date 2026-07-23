-- Add GPS coordinates to buyers so riders get exact delivery location
alter table public.buyers
  add column if not exists delivery_lat  double precision,
  add column if not exists delivery_lng  double precision;
