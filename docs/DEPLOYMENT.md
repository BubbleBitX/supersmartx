# Deployment

## Required environment
- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH`
- `NEXT_PUBLIC_ENABLE_GITHUB_AUTH`
- `ENABLE_PAYMENTS`
- `ENABLE_TRANSACTIONAL_EMAIL`
- `CASHFREE_APP_ID`
- `CASHFREE_SECRET_KEY`
- `CASHFREE_ENV`
- `CASHFREE_API_VERSION`

## Production database workflow
1. Run `npm run db:generate`
2. Run `npm run launch:check`
3. For the first production baseline only, mark the existing Supabase schema as applied:
   `npx prisma migrate resolve --applied 20260623123000_baseline --schema prisma/schema.prisma`
4. For every deploy after that, run `npm run db:migrate:deploy`
5. Run `npm run verify`

## Local-only database workflow
- `npm run db:push` is acceptable for disposable local environments
- Do not use `db:push` as the production release path

## Supabase auth checklist
- Set the Supabase site URL to `https://supersmartx.com` or `https://www.supersmartx.com`, whichever is your canonical production domain
- Add redirect URL `https://supersmartx.com/auth/callback` and/or `https://www.supersmartx.com/auth/callback` as needed
- Keep local redirect URL `http://localhost:3000/auth/callback`
- If `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true`, configure Google as a Supabase auth provider
- If `NEXT_PUBLIC_ENABLE_GITHUB_AUTH=true`, configure GitHub as a Supabase auth provider
- Ensure Supabase handles `https://<project>.supabase.co/auth/v1/callback` internally for OAuth provider flows

## Cashfree checklist
- Use `https://supersmartx.com` as the live website domain in Cashfree
- Use `https://supersmartx.com/payment/success` as the return destination base
- Use `https://supersmartx.com/api/payment/webhook` as the webhook endpoint
- Set `CASHFREE_ENV=production` before live launch
- Keep `ENABLE_PAYMENTS=false` until a real end-to-end test succeeds

## Release gate
- `npm run launch:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Confirm one real payment reaches `paid`, creates an access grant, and shows correctly in the dashboard billing section
- Confirm Google sign-in completes `auth/callback` and reaches `/dashboard`
- Confirm guest-first create flow still works without auth on the first generation
