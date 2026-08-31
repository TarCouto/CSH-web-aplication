-- Private bucket for product .zip files.
-- Signed URLs are generated server-side via the service role client;
-- no public storage policy is required.

insert into storage.buckets (id, name, public)
values ('products', 'products', false)
on conflict (id) do nothing;
