# CLAUDE.md — Working agreement for AI agents on CSH-web-aplication

Read this before planning or writing code. It exists to prevent the kind of subtle
mistakes that already cost real debugging time on this project.

## 1. Plan before coding (blindagem de planejamento)

For any feature, bugfix, or refactor:

1. **Read the docs first.** Start at `docs/README.md`, then open the docs relevant to the
   task (`03-routes-and-pages.md`, `14-auth-emails.md`, architecture, API, database…).
2. **Read the relevant Cursor rules** in `.cursor/rules/` — especially
   `architecture-and-docs.mdc` and `supabase-auth.mdc`.
3. **Follow existing patterns.** Match how similar pages, API routes, services, and
   clients are already built. Do not invent parallel structures. For UI/UX, spacing,
   or mobile layout, follow `.cursor/skills/senior-ui-ux/SKILL.md` and
   `src/lib/spacing.ts`.
4. **State assumptions explicitly** in the plan and validate the risky ones before
   writing a lot of code.

## 2. Verify library behavior — do not assume

Most bugs here came from *assuming* how a library works instead of checking.

- When a third-party library (Supabase, Stripe, Next.js) drives the flow, **confirm the
  actual behavior** (official docs / release notes / source) before relying on it.
- Be especially careful with **defaults you did not set** (e.g. `@supabase/ssr` forcing
  PKCE). A "recommended" client is not automatically right for every flow.
- Prefer the **latest year** in doc/web searches; APIs change.

## 3. Think about the full runtime path, not just the happy path

Before shipping, ask:

- **Who / what else touches this URL or token?** (email scanners prefetch links,
  webmail, mobile, SafeLinks, retries, double-clicks.)
- **Cross-device / cross-browser:** does an email link work when opened on another device?
- **One-time tokens:** never consume them on an automated `GET`.
- **Idempotency:** can this run twice safely (webhooks, retries)?
- **Stale/invalid sessions:** handle the error branch, don't just read the happy value.

## 4. Auth is a landmine here — see the dedicated rule

`.cursor/rules/supabase-auth.mdc` is mandatory reading for anything auth-related.
Key non-negotiables:

- Email OTPs (signup, magic link, recovery) are generated **and** verified with the
  non-PKCE `createOtpClient()` (`src/lib/supabase/auth-otp-client.ts`), never the
  `@supabase/ssr` client (which forces PKCE and breaks cross-device links).
- A correct confirmation `token_hash` must **not** start with `pkce_`.
- Email links open a **button page**; verification runs on the button's `POST`, never on
  the initial `GET`.

## 5. Definition of done

- [ ] Followed existing patterns; no parallel/duplicate structures.
- [ ] Verified any library behavior the change depends on.
- [ ] Considered scanners, cross-device, retries, and error branches.
- [ ] `npm run typecheck`, `npm run lint`, and `npm test` all pass.
- [ ] Updated the matching `docs/` file when behavior or routes changed.
- [ ] For auth changes: completed the checklist in `.cursor/rules/supabase-auth.mdc`.

## 6. Git / PR conventions

Follow the user's GIT_WORKFLOW rules: English branches/commits/PRs, Conventional Commits
with the Jira ID, GitFlow, and never reference AI tooling anywhere.
