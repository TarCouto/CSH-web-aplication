# Server business logic

This folder holds portable, framework-agnostic business logic for the marketplace and related features.

Code here must not import Next.js APIs (`next/server`, `next/headers`, route handlers, etc.). Keep services pure enough to extract into a standalone package or reuse in scripts and workers later.

Route handlers and Server Actions in `src/app` orchestrate these services; Supabase, Stripe, and storage access live in `src/lib`.
