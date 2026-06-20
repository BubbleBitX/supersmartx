-- SuperSmartX production schema for Supabase Postgres
-- This schema is the production source of truth for auth-linked users, profile data,
-- saved generations, billing access, usage limits, and webhook auditability.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'userplan') then
    create type userplan as enum ('free', 'pro', 'lifetime');
  end if;

  if not exists (select 1 from pg_type where typname = 'paymentprovider') then
    create type paymentprovider as enum ('cashfree');
  end if;

  if not exists (select 1 from pg_type where typname = 'paymentstatus') then
    create type paymentstatus as enum ('created', 'pending', 'paid', 'failed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'billinginterval') then
    create type billinginterval as enum ('none', 'days30', 'lifetime');
  end if;

  if not exists (select 1 from pg_type where typname = 'accessgrantstatus') then
    create type accessgrantstatus as enum ('active', 'expired', 'revoked');
  end if;

  if not exists (select 1 from pg_type where typname = 'usageeventkind') then
    create type usageeventkind as enum ('export_download');
  end if;

  if not exists (select 1 from pg_type where typname = 'webhookprocessingstatus') then
    create type webhookprocessingstatus as enum ('received', 'processed', 'ignored', 'failed');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key,
  email text unique,
  plan userplan not null default 'free',
  plan_expires_at timestamptz,
  downloads_this_month integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  name text not null default '',
  headline text not null default '',
  role text not null default '',
  company text not null default '',
  bio text not null default '',
  website text not null default '',
  photo_url text,
  logo_url text,
  brand_color text not null default '#a3e635',
  brand_theme text not null default 'dark' check (brand_theme in ('dark', 'light', 'premium', 'startup', 'corporate', 'modern')),
  social jsonb not null default '{}'::jsonb,
  setup_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_type_id text not null,
  event_type_label text not null,
  event_type_icon text not null,
  category text not null,
  category_color text not null,
  title text not null,
  values jsonb not null,
  platforms jsonb not null,
  captions jsonb not null,
  image_data_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_generations_user_created_at_idx
  on public.saved_generations (user_id, created_at desc);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider paymentprovider not null default 'cashfree',
  product_key text not null,
  plan userplan not null,
  billing_interval billinginterval not null default 'none',
  provider_order_id text not null unique,
  cf_order_id text unique,
  payment_session_id text,
  amount_paise integer not null,
  currency text not null default 'INR',
  status paymentstatus not null default 'created',
  provider_payload jsonb not null default '{}'::jsonb,
  access_starts_at timestamptz,
  access_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists payment_orders_user_created_at_idx
  on public.payment_orders (user_id, created_at desc);

create index if not exists payment_orders_status_created_at_idx
  on public.payment_orders (status, created_at desc);

create table if not exists public.access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  order_id uuid not null unique references public.payment_orders(id) on delete cascade,
  provider paymentprovider not null default 'cashfree',
  product_key text not null,
  plan userplan not null,
  billing_interval billinginterval not null,
  status accessgrantstatus not null default 'active',
  starts_at timestamptz not null,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists access_grants_user_status_ends_at_idx
  on public.access_grants (user_id, status, ends_at desc);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind usageeventkind not null,
  period_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_kind_period_created_at_idx
  on public.usage_events (user_id, kind, period_key, created_at desc);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  provider paymentprovider not null default 'cashfree',
  provider_event_id text unique,
  event_hash text not null unique,
  provider_order_id text,
  payment_status text,
  processing_status webhookprocessingstatus not null default 'received',
  payload jsonb not null,
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists webhook_events_provider_order_received_at_idx
  on public.webhook_events (provider_order_id, received_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute procedure public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_saved_generations_updated_at on public.saved_generations;
create trigger set_saved_generations_updated_at
before update on public.saved_generations
for each row execute procedure public.set_updated_at();

drop trigger if exists set_payment_orders_updated_at on public.payment_orders;
create trigger set_payment_orders_updated_at
before update on public.payment_orders
for each row execute procedure public.set_updated_at();

drop trigger if exists set_access_grants_updated_at on public.access_grants;
create trigger set_access_grants_updated_at
before update on public.access_grants
for each row execute procedure public.set_updated_at();

drop trigger if exists set_webhook_events_updated_at on public.webhook_events;
create trigger set_webhook_events_updated_at
before update on public.webhook_events
for each row execute procedure public.set_updated_at();

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_generations enable row level security;
alter table public.payment_orders enable row level security;
alter table public.access_grants enable row level security;
alter table public.usage_events enable row level security;
alter table public.webhook_events enable row level security;

drop policy if exists "Users manage own user row" on public.users;
create policy "Users manage own user row" on public.users
for all using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles
for all using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users manage own saved generations" on public.saved_generations;
create policy "Users manage own saved generations" on public.saved_generations
for all using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users manage own payment orders" on public.payment_orders;
create policy "Users manage own payment orders" on public.payment_orders
for select using (user_id = auth.uid());

drop policy if exists "Users read own access grants" on public.access_grants;
create policy "Users read own access grants" on public.access_grants
for select using (user_id = auth.uid());

drop policy if exists "Users read own usage events" on public.usage_events;
create policy "Users read own usage events" on public.usage_events
for select using (user_id = auth.uid());

drop policy if exists "Users read own webhook events" on public.webhook_events;
create policy "Users read own webhook events" on public.webhook_events
for select using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('profile-assets', 'profile-assets', true)
on conflict (id) do nothing;

drop policy if exists "Profile assets are publicly readable" on storage.objects;
create policy "Profile assets are publicly readable" on storage.objects
for select using (bucket_id = 'profile-assets');

drop policy if exists "Users upload own profile assets" on storage.objects;
create policy "Users upload own profile assets" on storage.objects
for insert with check (
  bucket_id = 'profile-assets'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users update own profile assets" on storage.objects;
create policy "Users update own profile assets" on storage.objects
for update using (
  bucket_id = 'profile-assets'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'profile-assets'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users delete own profile assets" on storage.objects;
create policy "Users delete own profile assets" on storage.objects
for delete using (
  bucket_id = 'profile-assets'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
);
