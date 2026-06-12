-- Go Zero To One — Full Schema (PRD §14)
-- Run in Supabase SQL Editor

-- ── USERS ──────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id          uuid primary key,
  email       text,
  plan        text not null default 'free',  -- 'free' | 'pro' | 'lifetime'
  downloads_this_month int not null default 0,
  created_at  timestamptz not null default now()
);

-- ── PROFILES ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  name         text,
  headline     text,
  role         text,
  company      text,
  bio          text,
  website      text,
  photo_url    text,
  logo_url     text,
  brand_color  text default '#a3e635',
  brand_theme  text default 'dark',
  social       jsonb default '{}',
  updated_at   timestamptz not null default now()
);

-- ── CATEGORIES ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id    text primary key,
  name  text not null,
  slug  text unique not null,
  icon  text,
  color text
);

-- ── EVENT TYPES ────────────────────────────────────────────────────────────
create table if not exists public.event_types (
  id          text primary key,
  category_id text not null references public.categories(id),
  label       text not null,
  icon        text,
  is_premium  boolean not null default false
);

-- ── EVENTS (user-created) ──────────────────────────────────────────────────
create table if not exists public.events (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  event_type_id  text not null references public.event_types(id),
  title          text not null,       -- interpolated cardHeadline
  values         jsonb not null,      -- form field values
  platforms      text[] not null,     -- platform slugs
  created_at     timestamptz not null default now()
);

-- ── PLATFORMS ──────────────────────────────────────────────────────────────
create table if not exists public.platforms (
  id    text primary key,
  name  text not null,
  slug  text unique not null,
  icon  text,
  color text
);

-- ── GENERATIONS ────────────────────────────────────────────────────────────
create table if not exists public.generations (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  platform_id text not null references public.platforms(id),
  content     text,
  image_url   text,
  created_at  timestamptz not null default now()
);

-- ── ROW-LEVEL SECURITY ─────────────────────────────────────────────────────
alter table public.users       enable row level security;
alter table public.profiles    enable row level security;
alter table public.events      enable row level security;
alter table public.generations enable row level security;

create policy "Users manage own user row" on public.users for all
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users manage own profile" on public.profiles for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users manage own events" on public.events for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users manage own generations" on public.generations for all
  using (event_id in (select id from public.events where user_id = auth.uid()))
  with check (event_id in (select id from public.events where user_id = auth.uid()));

-- ── STORAGE ────────────────────────────────────────────────────────────────
-- insert into storage.buckets (id, name, public) values ('profile-photos', 'profile-photos', true);
-- insert into storage.buckets (id, name, public) values ('generations', 'generations', true);

-- ── SEED: CATEGORIES ───────────────────────────────────────────────────────
insert into public.categories (id, name, slug, icon, color) values
  ('achievement', 'Achievement', 'achievement', '🏆', '#a3e635'),
  ('career',      'Career',      'career',      '💼', '#60a5fa'),
  ('founder',     'Founder',     'founder',     '🚀', '#fb923c'),
  ('creator',     'Creator',     'creator',     '🎬', '#c084fc'),
  ('growth',      'Growth',      'growth',      '📈', '#34d399'),
  ('revenue',     'Revenue',     'revenue',     '💰', '#fbbf24'),
  ('open-source', 'Open Source', 'open-source', '⭐', '#f472b6'),
  ('community',   'Community',   'community',   '🌐', '#818cf8'),
  ('events',      'Events',      'events',      '🎤', '#2dd4bf'),
  ('education',   'Education',   'education',   '🎓', '#e879f9'),
  ('newsletter',  'Newsletter',  'newsletter',  '📰', '#f87171')
on conflict (id) do nothing;

-- ── SEED: PLATFORMS ────────────────────────────────────────────────────────
insert into public.platforms (id, name, slug, icon, color) values
  ('linkedin',     'LinkedIn',      'linkedin',     '🔗', '#0077b5'),
  ('twitter',      'Twitter / X',   'twitter',      '𝕏',  '#000000'),
  ('threads',      'Threads',       'threads',      '🧵', '#000000'),
  ('instagram',    'Instagram',     'instagram',    '📸', '#e1306c'),
  ('reddit',       'Reddit',        'reddit',       '🤖', '#ff4500'),
  ('producthunt',  'Product Hunt',  'producthunt',  '🐱', '#da552f'),
  ('indiehackers', 'Indie Hackers', 'indiehackers', '⚒️', '#0070f3'),
  ('hackernews',   'Hacker News',   'hackernews',   '🔶', '#ff6600'),
  ('github',       'GitHub',        'github',       '🐙', '#333333'),
  ('devto',        'Dev.to',        'devto',        '👩‍💻', '#0a0a0a'),
  ('discord',      'Discord',       'discord',      '🎮', '#5865f2'),
  ('substack',     'Substack',      'substack',     '📓', '#ff6719')
on conflict (id) do nothing;
