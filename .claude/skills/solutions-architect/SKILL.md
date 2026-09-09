---
name: solutions-architect
description: Solution architecture for CSH / MeterKit. Use when deciding where new work belongs, adding a table, route, service, integration or dependency, changing a trust boundary, or weighing a trade-off. Triggers on architecture, design decision, new feature, new table, new integration, scale, cost, trade-off, or "where should this live".
---

# Solutions Architect — CSH

Read before designing anything that spans more than one file. This project is small on
purpose. Most architecture work here is **saying no to a new moving part**.

Product context: [docs/17-audience.md](../../../docs/17-audience.md) ·
Payments contract: [docs/16-payments.md](../../../docs/16-payments.md) ·
Layers: [docs/02-architecture.md](../../../docs/02-architecture.md)

## What this system is

One Next.js app that does three jobs: a marketing site, a one-product storefront
(MeterKit, `mode: 'payment'`, no subscriptions), and an account area that delivers a
paid ZIP. Buyers are developers (P1/P2) paying with a personal card in minutes.

Design for that: **fast to read, cheap to run, boring to operate.** Not for scale we
don't have.

## Who owns which truth

| Truth | Owner | Never |
|-------|-------|-------|
| Price, payment, refund, invoice | **Stripe** | Never trust a price sent by the browser |
| Catalog copy, order, entitlement | **Supabase** | Never let the browser write these |
| Product archive | **Supabase Storage** (private bucket) | Never in the database, never a public URL |
| Session | Supabase Auth cookies | Never a home-grown token |
| Transactional email | Zoho SMTP | Never block a request forever on it |

If a change makes two systems own the same truth, it is the wrong change.

## Trust boundaries (the spine of this app)

```
anon           → RLS + column grants   → published product columns only
authenticated  → RLS                   → own profile / orders / entitlements
service_role   → bypasses everything   → server-only, never in a client component
Stripe webhook → HMAC signature        → the only unauthenticated writer
```

Escalating to `service_role` is a **decision**, not a convenience. Write down why in the
diff. `src/lib/supabase/service.ts` carries the warning; keep it true.

## Where new work goes

| Need | Put it in | Not in |
|------|-----------|--------|
| Business rule | `src/server/services/*.ts` (clients as params) | A route handler |
| HTTP concern (status, headers, parsing) | `src/app/api/**/route.ts` | A service |
| Shared pure helper | `src/lib/*.ts` | Duplicated in two routes |
| Schema, policy, grant, RPC | `supabase/migrations/000N_*.sql` | Ad-hoc SQL in the dashboard |
| Anything visual | see skill `senior-ui-ux` | A new design system |

Import services by direct path — `src/server/services/index.ts` is a deliberate
placeholder, not a barrel to fill.

## Before you add a moving part

Ask, in order:

1. **Does an existing piece already do this?** (`http.ts`, `validation.ts`, `rate-limit.ts`,
   `metadata.ts`, `spacing.ts`, `get-client-ip.ts` exist precisely to stop duplication.)
2. **What breaks when it is missing or down?** Prefer fail-closed for auth and money,
   fail-soft for email and analytics.
3. **Who can call it, and what happens if they call it 10.000 times?** Every new public
   endpoint needs a rate-limit answer before it ships.
4. **Does it survive a retry?** Webhooks, email links and double-clicks all retry.
5. **What does it cost per request?** A Stripe or Supabase round trip on a hot path is a
   real cost; one on the marketing pages is a mistake.

A new npm dependency needs a reason that outlives the afternoon. A new table needs a
retention answer (see `docs/12-database.md`).

## Runtime constraints that already bit us

- **Serverless memory:** the download route buffers the whole archive twice (raw +
  re-zipped with `LICENSE.txt`). Large products are a memory ceiling, not a nice-to-have
  optimization. Any growth in archive size is an architecture decision.
- **Per-instance state is a lie.** In-memory counters reset on cold start and do not
  cross instances — that is why rate limiting is Postgres-backed with a memory fallback.
- **Missing env in production must fail loudly**, not degrade into localhost URLs or an
  unauthenticated middleware.

## Non-negotiables

- The browser never learns `storage_path`, `stripe_price_id` or `stripe_product_id`
  (revoked from `anon`/`authenticated` in `0005_column_privileges.sql`).
- Orders and entitlements are written only after the **server** re-verifies the session
  with Stripe and matches its metadata `userId` to the signed-in user. A `session_id` in
  the URL proves nothing.
- One-time tokens are never consumed on a `GET` (see rule `supabase-auth`).
- Delivery streams from the server; no signed URL, nothing shareable leaves the app.

## Review checklist

- [ ] The change keeps one owner per truth
- [ ] Any `service_role` use is justified in the diff and server-only
- [ ] New endpoints have auth, origin, rate-limit and validation answers
- [ ] New tables have RLS, explicit grants, and a retention answer
- [ ] Retry and cross-device paths considered
- [ ] The matching `docs/` file updated
