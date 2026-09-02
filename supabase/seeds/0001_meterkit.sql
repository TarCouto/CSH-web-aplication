-- Catalog seed (not a schema migration).
-- Test-mode Stripe IDs for MeterKit. Do not apply this file to production
-- with these ids — Live has a different prod_/price_ pair.
--
-- Idempotent: matches by slug or existing Stripe ids.

with target as (
  select id
  from public.products
  where slug = 'meterkit'
     or stripe_product_id = 'prod_VBgOodIM7Xn64y'
     or stripe_price_id = 'price_1UBJ1vPYevgYGEkJ8gR5fZ94'
  limit 1
),
updated as (
  update public.products as p
  set
    slug = 'meterkit',
    name = 'MeterKit',
    tagline = 'Production-ready AI SaaS starter with credit-based billing',
    description = $desc$
Auth, multi-tenant orgs, LLM integration, and usage billing — the four things every AI SaaS rebuilds.

The durable piece is the credit ledger: reserve → settle → release. Failed LLM streams refund the hold; completed calls charge real tokens, not estimates.
$desc$,
    features = '[
      "Auth and multi-tenant orgs",
      "LLM integration",
      "Append-only credit ledger (reserve → settle → release)",
      "One-time license, source code included"
    ]'::jsonb,
    tech_stack = '["Next.js", "NestJS", "Stripe", "Postgres"]'::jsonb,
    price_cents = 24900,
    currency = 'usd',
    stripe_product_id = 'prod_VBgOodIM7Xn64y',
    stripe_price_id = 'price_1UBJ1vPYevgYGEkJ8gR5fZ94',
    updated_at = now()
  from target
  where p.id = target.id
  returning p.id
)
insert into public.products (
  slug,
  name,
  tagline,
  description,
  features,
  tech_stack,
  price_cents,
  currency,
  stripe_product_id,
  stripe_price_id,
  status
)
select
  'meterkit',
  'MeterKit',
  'Production-ready AI SaaS starter with credit-based billing',
  $desc$
Auth, multi-tenant orgs, LLM integration, and usage billing — the four things every AI SaaS rebuilds.

The durable piece is the credit ledger: reserve → settle → release. Failed LLM streams refund the hold; completed calls charge real tokens, not estimates.
$desc$,
  '[
    "Auth and multi-tenant orgs",
    "LLM integration",
    "Append-only credit ledger (reserve → settle → release)",
    "One-time license, source code included"
  ]'::jsonb,
  '["Next.js", "NestJS", "Stripe", "Postgres"]'::jsonb,
  24900,
  'usd',
  'prod_VBgOodIM7Xn64y',
  'price_1UBJ1vPYevgYGEkJ8gR5fZ94',
  'draft'
where not exists (select 1 from updated);
