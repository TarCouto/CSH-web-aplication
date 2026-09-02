-- B1: Restrict profiles_update_own — block changes to id, email, stripe_customer_id
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and id is not distinct from (
      select p.id from public.profiles as p where p.id = profiles.id
    )
    and email is not distinct from (
      select p.email from public.profiles as p where p.id = profiles.id
    )
    and stripe_customer_id is not distinct from (
      select p.stripe_customer_id from public.profiles as p where p.id = profiles.id
    )
  );

-- B2: Atomic download counter increment (service role only)
create or replace function public.increment_download_count(entitlement_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.entitlements
  set download_count = download_count + 1
  where id = entitlement_id
    and download_count < download_limit;

  return found;
end;
$$;

create or replace function public.decrement_download_count(entitlement_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.entitlements
  set download_count = greatest(download_count - 1, 0)
  where id = entitlement_id
    and download_count > 0;

  return found;
end;
$$;

revoke all on function public.increment_download_count(uuid) from public;
revoke all on function public.increment_download_count(uuid) from anon;
revoke all on function public.increment_download_count(uuid) from authenticated;
grant execute on function public.increment_download_count(uuid) to service_role;

revoke all on function public.decrement_download_count(uuid) from public;
revoke all on function public.decrement_download_count(uuid) from anon;
revoke all on function public.decrement_download_count(uuid) from authenticated;
grant execute on function public.decrement_download_count(uuid) to service_role;

-- B3: Missing indexes (idempotent)
create index if not exists orders_user_id_idx
  on public.orders (user_id, created_at desc);

create index if not exists downloads_user_id_idx
  on public.downloads (user_id);

create index if not exists products_status_idx
  on public.products (status);

create index if not exists orders_product_id_idx
  on public.orders (product_id);

create index if not exists entitlements_product_id_idx
  on public.entitlements (product_id);

create index if not exists entitlements_order_id_idx
  on public.entitlements (order_id);

create index if not exists downloads_entitlement_id_idx
  on public.downloads (entitlement_id);

-- B4: RLS on schema_migrations (deny-all for PostgREST roles)
alter table if exists public.schema_migrations enable row level security;

-- D1: Persistent rate limiting (RLS enabled, no policies)
create table if not exists public.rate_limits (
  key text primary key,
  count int not null default 0,
  reset_at timestamptz not null
);

alter table public.rate_limits enable row level security;

create or replace function public.check_rate_limit(
  p_key text,
  p_limit int,
  p_window_seconds int
)
returns table(allowed boolean, retry_after int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_count int;
  v_reset_at timestamptz;
begin
  insert into public.rate_limits as rl (key, count, reset_at)
  values (
    p_key,
    1,
    v_now + make_interval(secs => p_window_seconds)
  )
  on conflict (key) do update
  set
    count = case
      when rl.reset_at <= v_now then 1
      else rl.count + 1
    end,
    reset_at = case
      when rl.reset_at <= v_now then v_now + make_interval(secs => p_window_seconds)
      else rl.reset_at
    end
  returning rl.count, rl.reset_at into v_count, v_reset_at;

  return query
  select
    v_count <= p_limit,
    greatest(0, ceil(extract(epoch from (v_reset_at - v_now)))::int);
end;
$$;

revoke all on function public.check_rate_limit(text, int, int) from public;
revoke all on function public.check_rate_limit(text, int, int) from anon;
revoke all on function public.check_rate_limit(text, int, int) from authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;
