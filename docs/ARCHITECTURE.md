# Architecture

## Current production architecture
- Next.js 16 App Router
- React 19
- TypeScript
- Supabase Auth + Storage
- Prisma on Supabase Postgres as the application source of truth
- Cashfree order checkout with signed webhook confirmation

## Persistence model
- `users`: auth-linked application users with effective access cache
- `profiles`: reusable identity and branding defaults
- `saved_generations`: milestone history and reusable output data
- `payment_orders`: checkout and payment reconciliation records
- `access_grants`: paid access windows derived from confirmed orders
- `usage_events`: server-tracked export usage for free-plan enforcement
- `webhook_events`: webhook receipt and processing audit trail

## Launch architecture decision
- Ship as a single web app with server-side persistence only
- Treat Supabase Postgres as the production source of truth
- Keep payment activation dependent on verified webhook confirmation
- Keep transactional email disabled until a protected server-side flow exists

## Production rules
- No local database or browser storage is used as a persistence layer
- Free-plan limits must be enforced server-side before export
- Paid access must be derived from `access_grants`, not inferred from UI state
- Webhook processing must be idempotent and auditable
