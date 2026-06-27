-- WEN platform — initial schema
-- Covers: farmer registration, buyer registration, orders, admin reporting

create extension if not exists "pgcrypto";

-- ── Farmers ──────────────────────────────────────────────────────────────────
create table public.farmers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null,
  location text not null,
  produce_type text not null,
  estimated_quantity text,
  farming_experience text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected', 'inactive')),
  created_at timestamptz not null default now()
);

create index farmers_status_idx on public.farmers (status);
create index farmers_created_at_idx on public.farmers (created_at desc);

-- ── Buyers ───────────────────────────────────────────────────────────────────
create table public.buyers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null,
  location text not null,
  buyer_type text not null check (buyer_type in ('household', 'business', 'restaurant')),
  products_interested text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected', 'inactive')),
  created_at timestamptz not null default now()
);

create index buyers_status_idx on public.buyers (status);
create index buyers_created_at_idx on public.buyers (created_at desc);

-- ── Products (what's currently available, shown on the public Products page) ─
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('vegetables', 'grains', 'tubers', 'poultry', 'fish', 'other')),
  unit text,                          -- e.g. "per basket", "per kg", "per crate"
  is_available boolean not null default true,
  farmer_id uuid references public.farmers(id) on delete set null,
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_available_idx on public.products (is_available);

-- ── Orders ───────────────────────────────────────────────────────────────────
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyers(id) on delete cascade,
  farmer_id uuid references public.farmers(id) on delete set null,
  product_summary text not null,      -- free-text description of what's being ordered (MVP — no line-item table yet)
  status text not null default 'pending' check (status in ('pending', 'matched', 'in_progress', 'delivered', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_status_idx on public.orders (status);
create index orders_buyer_idx on public.orders (buyer_id);
create index orders_farmer_idx on public.orders (farmer_id);

-- Keep updated_at current on every order change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ── Contact messages (from the Contact Us page) ───────────────────────────────
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Public forms write through the service-role admin client (server-side only),
-- so anonymous INSERT policies aren't needed for farmers/buyers/orders/contact —
-- the app never lets the browser talk to these tables directly.
-- Admin reads happen through an authenticated session (Supabase Auth), gated below.

alter table public.farmers enable row level security;
alter table public.buyers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.contact_messages enable row level security;

-- Authenticated admin users can read/write everything.
-- (MVP: any authenticated user is treated as admin — there's no separate admin
-- accounts table yet. Tighten this once real multi-admin access is needed.)
create policy "Authenticated users can manage farmers" on public.farmers
  for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage buyers" on public.buyers
  for all using (auth.role() = 'authenticated');

create policy "Anyone can view available products" on public.products
  for select using (is_available = true);

create policy "Authenticated users can manage products" on public.products
  for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage orders" on public.orders
  for all using (auth.role() = 'authenticated');

create policy "Authenticated users can view contact messages" on public.contact_messages
  for select using (auth.role() = 'authenticated');
