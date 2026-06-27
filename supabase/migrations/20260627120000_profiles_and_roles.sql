-- WEN platform — profiles + role-based access
-- Adds a profiles table (1:1 with auth.users) so we have somewhere to put
-- a role. Replaces the MVP "any authenticated user is an admin" policies
-- with real role checks.

-- ── Profiles ─────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Every new auth user automatically gets a profile row, defaulting to 'user'.
-- Promotion to 'admin' is a separate, deliberate step (one-time SQL update),
-- never automatic.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- Users can read their own profile (needed so the app can check its own role).
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

-- Helper used by the other tables' RLS policies below — checks the CURRENT
-- caller's role directly off auth.uid(), not the row being read/written, so
-- it can't be used by a non-admin to read someone else's profile row.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ── Tighten existing policies: 'authenticated' -> 'admin role' ───────────────
drop policy "Authenticated users can manage farmers" on public.farmers;
create policy "Admins can manage farmers" on public.farmers
  for all using (public.is_admin());

drop policy "Authenticated users can manage buyers" on public.buyers;
create policy "Admins can manage buyers" on public.buyers
  for all using (public.is_admin());

drop policy "Authenticated users can manage products" on public.products;
create policy "Admins can manage products" on public.products
  for all using (public.is_admin());

drop policy "Authenticated users can manage orders" on public.orders;
create policy "Admins can manage orders" on public.orders
  for all using (public.is_admin());

drop policy "Authenticated users can view contact messages" on public.contact_messages;
create policy "Admins can view contact messages" on public.contact_messages
  for select using (public.is_admin());
