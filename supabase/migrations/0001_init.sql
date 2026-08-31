create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  features jsonb not null default '[]'::jsonb,
  tech_stack jsonb not null default '[]'::jsonb,
  price_cents integer not null default 0,
  currency text not null default 'usd',
  cover_image text,
  stripe_product_id text,
  stripe_price_id text unique,
  storage_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id),
  stripe_checkout_session_id text unique,
  stripe_payment_intent text,
  amount_cents integer,
  currency text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded')),
  created_at timestamptz not null default now()
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id),
  order_id uuid references public.orders (id),
  download_count integer not null default 0,
  download_limit integer not null default 5,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  entitlement_id uuid references public.entitlements (id) on delete cascade,
  user_id uuid not null,
  product_id uuid not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.entitlements enable row level security;
alter table public.downloads enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "products_select_published"
  on public.products
  for select
  to anon, authenticated
  using (status = 'published');

create policy "orders_select_own"
  on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "entitlements_select_own"
  on public.entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "downloads_select_own"
  on public.downloads
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();
