-- Column-level privileges: hide internal product columns from the public API.
--
-- RLS decides WHICH ROWS a role may read; it cannot hide COLUMNS. The
-- products_select_published policy therefore exposed every column of a
-- published product through PostgREST, including storage_path (the path of the
-- paid archive inside the private bucket) and the Stripe object ids.
--
-- Column grants are the missing half: anon/authenticated may read only the
-- columns the storefront renders. storage_path and the Stripe ids stay
-- readable by service_role, which is what the checkout and download routes use.

revoke select on public.products from anon, authenticated;

grant select (
  id,
  slug,
  name,
  tagline,
  description,
  features,
  tech_stack,
  price_cents,
  currency,
  cover_image,
  status,
  created_at,
  updated_at
) on public.products to anon, authenticated;

-- Defense in depth: these roles never write through PostgREST. RLS already
-- denies it (no INSERT/UPDATE/DELETE policies), but Supabase's default table
-- grants leave the privilege in place, so remove it as a second barrier.
revoke insert, update, delete, truncate on public.products from anon, authenticated;
revoke insert, update, delete, truncate on public.orders from anon, authenticated;
revoke insert, update, delete, truncate on public.entitlements from anon, authenticated;
revoke insert, update, delete, truncate on public.downloads from anon, authenticated;

-- profiles keeps INSERT/UPDATE for authenticated: the signup trigger inserts
-- the row and the dashboard updates full_name from the browser. The
-- profiles_update_own policy (0004) pins id, email and stripe_customer_id.
revoke delete, truncate on public.profiles from anon, authenticated;

-- Server-side paths must keep full access.
grant all on public.products to service_role;
grant all on public.orders to service_role;
grant all on public.entitlements to service_role;
grant all on public.downloads to service_role;
grant all on public.profiles to service_role;

-- Expired rate-limit rows are dead weight and hold client IPs in the primary
-- key. Reclaim them opportunistically (~1% of calls) so the table stays small
-- and old IPs do not accumulate indefinitely.
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
  if random() < 0.01 then
    delete from public.rate_limits
    where reset_at < v_now - interval '1 day';
  end if;

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
