-- Add landmark/directions field to buyers for rider navigation
alter table public.buyers
  add column if not exists landmark text;
