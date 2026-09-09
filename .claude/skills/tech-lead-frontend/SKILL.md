---
name: tech-lead-frontend
description: Frontend tech lead for CSH — React 19 / Next 16 App Router. Use when adding or reviewing a page, component, form, client/server boundary, metadata, loading or error state, or data flow into the UI. Triggers on page, component, 'use client', server component, form, metadata, SEO, robots, loading, error boundary, or dashboard.
---

# Tech Lead Frontend — CSH

Visual decisions live in skill `senior-ui-ux` (spacing, gutters, rhythm). **This skill is
about structure**: what runs where, what data reaches the browser, and what the user sees
while it loads or fails.

Routes: [docs/03-routes-and-pages.md](../../../docs/03-routes-and-pages.md) ·
Components: [docs/04-components.md](../../../docs/04-components.md)

## Server by default

Every page and component is a **server component** unless it needs state, an effect, or a
browser API. The client boundary is currently 15 files — treat that list as a budget:

`ContactForm` · `NewsletterForm` · `RootLayout` · `AuthSessionProvider` ·
`ConfirmEmailButton` · `LoginForm` · `SignupForm` · `CheckoutSuccessPreparing` ·
`BillingPortalButton` · `DashboardNav` · `ProfileForm` · `BuyButton` · `ThemeProvider` ·
`ThemeToggle` · `app/error.tsx`

Adding to it needs a reason in the PR. Pushing `'use client'` up a tree to avoid a prop
drill is not a reason — it ships the whole subtree to the browser.

## Data reaches the UI through services

```
page.tsx (async server component)
  → src/server/services/*.ts   (receives the Supabase client)
  → props → server components
```

- **Never fetch business data inside a client component.** Client components call our own
  API routes (`BuyButton` → `/api/checkout`) or Supabase for the user's own row
  (`ProfileForm`), nothing else.
- **Never widen a select to reach the client.** Public product reads return
  `PublicProduct`; `storage_path` and the Stripe ids are revoked from `anon`/
  `authenticated` and a `select('*')` on a non-service client will now fail outright.
- A prop on a `'use client'` component is **serialized into the page payload** — it is
  public. Never pass a full DB row across that line.

## Forms

Match `LoginForm` / `ProfileForm`:

- Native `<form onSubmit>` + `FormData`, no form library.
- `loading` disables the submit; `error` and success are separate states.
- Every error/success message needs `role="alert"` — screen readers get nothing otherwise.
- **Never render a raw database or provider error.** `console.error` the real one, show a
  short human sentence. Provider strings leak column, constraint and policy names, and on
  auth they become an account-enumeration oracle.
- Validate the obvious things client-side for UX, but the server always re-validates.

## Metadata, indexing, SEO

- Public page → export `metadata` with `title` + `description`.
- Account, checkout and confirm pages → `robots: NO_INDEX_ROBOTS` from `@/lib/metadata`.
  The dashboard layout already sets it for the whole segment; do not repeat it per page.
- Canonical URLs and the sitemap derive from the configured site URL — do not hardcode
  `https://couto.software` in a new file.

## Loading and failure are part of the design

- A route that awaits Supabase or Stripe needs a `loading.tsx` skeleton — a blank screen
  is a bug, not a default.
- `useSearchParams` consumers must sit inside `<Suspense>`.
- Empty states are designed, with a next action (see `PurchasedProductsList`,
  `PurchasesTable`, `DashboardOverview`).
- Auth-gated pages fail closed: redirect, never render an empty authenticated shell.

## Things that already bit us

- **Static pages cannot show session state.** A `force-static` page freezes
  `isAuthenticated` at build time, so the header lies to a logged-in visitor. Decide per
  page: dynamic, or no session-dependent UI.
- **CSP is enforced in production.** No new external script or stylesheet host without
  updating `next.config.mjs`; inline `<script>` beyond the theme bootstrap will be blocked.
- **`next-env.d.ts` is generated.** Types for image imports come from `next typegen`; a
  fresh checkout must run it before `tsc`.

## Review checklist

- [ ] New component is a server component, or the client reason is written down
- [ ] No business data fetched inside a client component
- [ ] No internal column crosses the client boundary
- [ ] Errors are human sentences; raw provider messages only in `console.error`
- [ ] `role="alert"` on every form feedback message
- [ ] `metadata` set; private routes carry `NO_INDEX_ROBOTS`
- [ ] Loading and empty states exist for async routes
- [ ] Spacing follows `@/lib/spacing` and skill `senior-ui-ux`
- [ ] `npm run typecheck && npm run lint && npm test` pass
