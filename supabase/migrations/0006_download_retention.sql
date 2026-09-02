-- Data retention for the download audit log.
--
-- downloads records user_id, product_id, IP and user-agent on every delivery.
-- Two problems this migration fixes:
--
--   1. user_id had no foreign key, so deleting an account left the IP and the
--      user id behind forever — the LGPD/GDPR erasure request could not be
--      honoured by deleting the user.
--   2. Nothing ever expired. A breach would expose the full download history
--      of every customer since launch.
--
-- The audit trail still serves its anti-piracy purpose: who downloaded what
-- and when stays available for RETENTION_DAYS. The directly identifying part
-- (IP, user-agent) is erased much earlier, at ANONYMISE_DAYS.

-- 1. Account deletion now cascades into the audit log.
alter table public.downloads
  add constraint downloads_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

-- product_id gets the same treatment as entitlements.product_id for
-- referential integrity.
alter table public.downloads
  add constraint downloads_product_id_fkey
  foreign key (product_id) references public.products (id) on delete cascade;

-- 2. Retention sweep needs an index on the age predicate.
create index if not exists downloads_created_at_idx
  on public.downloads (created_at);

/**
 * Progressive anonymisation, then deletion.
 *   - after anonymise_days: null out ip and user_agent, keep the event
 *   - after retention_days: delete the row entirely
 * Returns the number of rows deleted.
 */
create or replace function public.purge_expired_downloads(
  anonymise_days int default 30,
  retention_days int default 180
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_deleted int;
begin
  update public.downloads
  set ip = null,
      user_agent = null
  where created_at < v_now - make_interval(days => anonymise_days)
    and (ip is not null or user_agent is not null);

  delete from public.downloads
  where created_at < v_now - make_interval(days => retention_days);

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.purge_expired_downloads(int, int) from public;
revoke all on function public.purge_expired_downloads(int, int) from anon;
revoke all on function public.purge_expired_downloads(int, int) from authenticated;
grant execute on function public.purge_expired_downloads(int, int) to service_role;

-- 3. The dashboard never reads this table; only the service role does. Drop
-- the user-facing policy so a session token cannot read back its own IPs.
drop policy if exists "downloads_select_own" on public.downloads;
