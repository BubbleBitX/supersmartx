# Deployment

## Required environment
- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH`
- `ENABLE_PAYMENTS`
- `ENABLE_TRANSACTIONAL_EMAIL`
- `CASHFREE_APP_ID`
- `CASHFREE_SECRET_KEY`
- `CASHFREE_ENV`
- `CASHFREE_API_VERSION`

## Database bootstrap
1. Run `npm run db:generate`
2. Run `npm run db:push`
3. Apply `supabase/schema.sql` only when you need a manual SQL bootstrap or a non-Prisma environment match check

## CI gate
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Release rule
- Do not enable `ENABLE_PAYMENTS=true` until `NEXT_PUBLIC_APP_URL` is a public HTTPS URL and Cashfree credentials are configured in the target environment
- Do not enable `ENABLE_TRANSACTIONAL_EMAIL=true` until email verification and abuse controls exist
- Verify Google OAuth redirect URLs in both Supabase and Google Cloud before production cutover
