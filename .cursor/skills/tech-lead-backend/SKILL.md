---
name: tech-lead-backend
description: Backend tech lead for CSH — API routes, services, Supabase, Stripe, migrations. Use when adding or reviewing an API route, server service, RLS policy, migration, webhook handler, rate limit, or anything touching money, entitlements or the private bucket. Triggers on API route, service, webhook, Stripe, Supabase, RLS, migration, SQL, rate limit, download, or entitlement.
---

# Tech Lead Backend — CSH

Auth flows have their own mandatory rule: `.cursor/rules/supabase-auth.mdc`.
Payments detail: [docs/16-payments.md](../../../docs/16-payments.md) ·
Database: [docs/12-database.md](../../../docs/12-database.md)

## Shape of every route

Routes are **thin adapters**. Business logic goes in `src/server/services/*.ts`, which
receive the Supabase/Stripe client as a parameter — that is what makes them testable
without mocking Next.

Preamble order in a cookie-authenticated route, and it is an order, not a set:

```ts
1. isSameOrigin(request)        → crossOriginResponse()      // CSRF
2. supabase.auth.getUser()      → 401                        // who
3. rateLimit(`scope:${user.id}`) → tooManyRequestsResponse()  // how often
4. isValidUuid / isValidEmail   → invalidPayloadResponse()    // what
5. …work…
```

**Redirecting after a form POST uses 303**, via `redirectAfterPost()`.
`NextResponse.redirect` defaults to 307, which preserves the method: the browser re-POSTs
to the target, a page route answers 405, and the user lands on a blank error screen. This
shipped once — that is why the helper exists.

Authenticate **before** reporting configuration state: an anonymous caller must not learn
whether Stripe is set up. Reuse `src/lib/http.ts` and `src/lib/validation.ts` — do not
hand-roll a fourth 429 body.

## Supabase clients — pick deliberately

| Use case | Client |
|----------|--------|
| Session in a server component / route | `createClient()` — `supabase/server.ts` |
| Browser | `createClient()` — `supabase/client.ts` |
| **Email OTP (signup, magic link, recovery)** | `createOtpClient()` — non-PKCE, see auth rule |
| Admin / bypass RLS, **server only** | `createServiceClient()` — `supabase/service.ts` |

RLS filters **rows**, not **columns**. `0005_column_privileges.sql` revokes
`storage_path`, `stripe_price_id` and `stripe_product_id` from `anon`/`authenticated`, so:

- Public product reads use the explicit public column list → `PublicProduct`.
- Anything needing those columns uses the **service client**
  (`getPublishedProductForCheckout`, the download route).
- A `select('*')` on `products` with a non-service client now fails. That is intended.

## Money: the invariants

- **Verify the webhook signature on the raw body** (`request.text()`), before any DB work.
- **Return 5xx when a handler genuinely fails** so Stripe retries. Returning 200 on error
  means a paying customer silently never receives the product.
- **Idempotency is not optional.** `orders.stripe_checkout_session_id` is unique, and a
  retry must also repair a *partial* fulfillment — an order row without its entitlement
  has to be completed, not skipped.
- **Guard `payment_status`**, and remember `no_payment_required` (100%-off coupon) is a
  legitimate paid state.
- **A partial refund is not a refund.** Compare `amount_refunded` with `amount` before
  revoking access; disputes bypass that check explicitly.
- Counters that gate access are **atomic RPCs** (`increment_download_count` /
  `decrement_download_count`), never read-modify-write. Reserve before delivering, and
  give the credit back if delivery fails.

## Migrations

- Numbered file in `supabase/migrations/`, applied once, inside a transaction, via
  `npm run db:migrate`. Never patch production from the dashboard.
- Idempotent where possible (`if not exists`, `create or replace`).
- A new table ships with: RLS enabled, explicit policies (or none = deny-all), revoked
  write grants for `anon`/`authenticated`, needed indexes, and a **retention answer**.
- `security definer` functions always `set search_path = public`, and are revoked from
  `public`/`anon`/`authenticated` before granting to `service_role`.
- **Order of operations matters:** deploy code that tolerates the new schema *before*
  applying a migration that removes access.

## Secrets and config

- Secrets stay behind lazy getters in `src/lib/env.ts` so the marketing build works
  without marketplace config; only `NEXT_PUBLIC_*` may reach the browser.
- Missing production config **throws**; it never degrades to localhost or to an
  unauthenticated middleware.
- Rate limiting is Postgres-backed. Without `SUPABASE_SERVICE_ROLE_KEY` it silently falls
  back to a per-instance map — which on serverless is no rate limiting at all.

## Testing

`npm test` runs `node --test` through `tsx`. Services take their clients as parameters, so
use in-memory fakes — no network, no mocking framework.

Cover the paths where being wrong costs money or access: fulfillment (duplicate, partial,
unpaid, free), refunds (full vs partial vs dispute), quota exhaustion, and origin checks.

## Review checklist

- [ ] Route is thin; logic sits in a service that takes its clients as params
- [ ] Origin → auth → rate limit → validation, in that order
- [ ] `service_role` used only where column grants or RLS require it
- [ ] Webhook: signature verified, 5xx on real failure, idempotent on retry
- [ ] Access counters go through the atomic RPCs
- [ ] Migration has RLS, grants, indexes, retention — and deploys after the code
- [ ] Errors logged with context; responses stay generic
- [ ] `npm run typecheck && npm run lint && npm test` pass; `docs/` updated
