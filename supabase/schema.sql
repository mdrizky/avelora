-- =====================================================================
-- AVELORA — Supabase/PostgreSQL schema (v1)
-- Dibuat agar 1:1 dengan tipe data di lib/db/types.ts (ERD PRD §11).
--
-- Cara pakai:
--   1) Buka https://supabase.com/dashboard -> pilih project
--   2) SQL Editor -> tempel & Jalankan SEMUA statement ini
--   3) Salin Project URL -> SUPABASE_URL dan Service Role Key ->
--      SUPABASE_SERVICE_ROLE_KEY (Project Settings > API)
--   4) Jalankan `npm run db:export` lalu `npm run db:import`
--   5) Set DATABASE_STORE=supabase di .env.local lalu `npm run dev`
--
-- Catatan keamanan:
--   RLS diaktifkan di semua tabel. Aplikasi menulis via service_role
--   (server-only, tidak pernah bocor ke client). Untuk produksi publik,
--   tambahkan policy per-user bila arsitektur berpindah ke client-side.
-- =====================================================================

-- ---------------------------------------------------------------------
-- ENTITY (master) : profi / kategori / template / paket / musik
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id              text primary key,
  email           text not null unique,
  first_name      text not null,
  last_name       text not null,
  phone           text,
  avatar_url      text,
  role            text not null default 'user' check (role in ('user','admin')),
  password_hash   text not null,
  is_verified     boolean not null default false,
  is_suspended    boolean not null default false,
  last_login_at   timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists public.event_categories (
  id         text primary key,
  name       text not null,
  slug       text not null unique,
  icon       text,
  tagline    text,
  is_active  boolean not null default true
);

create table if not exists public.templates (
  id             text primary key,
  name           text not null,
  slug           text not null unique,
  category_id    text not null references public.event_categories(id) on delete cascade,
  thumbnail_url  text,
  preview_url    text,
  theme_config   jsonb not null default '{}'::jsonb,
  is_premium     boolean not null default false,
  price          numeric(12,0) not null default 0,
  is_active      boolean not null default true,
  created_by     text references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now()
);

create table if not exists public.music_tracks (
  id            text primary key,
  title         text not null,
  artist        text not null,
  category      text not null,
  audio_url     text,
  duration      text,
  license_note  text not null default '',
  is_active     boolean not null default true,
  uploaded_by   text references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

create table if not exists public.plans (
  id            text primary key,
  name          text not null unique,
  display_name  text not null,
  price         numeric(12,0) not null default 0,
  period        text not null default 'month',
  features      jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true
);

create table if not exists public.coupons (
  id              text primary key,
  code            text not null unique,
  discount_type   text not null check (discount_type in ('percent','amount')),
  discount_value  numeric(12,0) not null default 0,
  quota           int not null default 0,
  used_count      int not null default 0,
  expires_at      timestamptz,
  is_active       boolean not null default true
);

-- ---------------------------------------------------------------------
-- UNDANGAN + konten
-- ---------------------------------------------------------------------

create table if not exists public.invitations (
  id                    text primary key,
  owner_id              text not null references public.profiles(id) on delete cascade,
  template_id           text not null references public.templates(id) on delete cascade,
  category_id           text not null references public.event_categories(id) on delete cascade,
  slug                  text not null,
  title                 text not null,
  status                text not null default 'draft' check (status in ('draft','published','expired','memory')),
  content_data          jsonb not null default '{}'::jsonb,
  theme_config          jsonb not null default '{}'::jsonb,
  music_track_id        text references public.music_tracks(id) on delete set null,
  timezone              text not null default 'Asia/Jakarta',
  event_date            timestamptz,
  city                  text,
  custom_url_enabled    boolean not null default false,
  watermark_enabled     boolean not null default true,
  remove_branding       boolean not null default false,
  published_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (owner_id, slug)
);

create table if not exists public.event_schedules (
  id              text primary key,
  invitation_id   text not null references public.invitations(id) on delete cascade,
  label           text not null,
  event_date      timestamptz not null,
  start_time      text not null,
  end_time        text,
  location_name   text not null,
  address         text not null,
  maps_url        text not null,
  map_embed_url   text,
  order_index     int not null default 0
);

create table if not exists public.gallery_images (
  id              text primary key,
  invitation_id   text not null references public.invitations(id) on delete cascade,
  image_url       text not null,
  order_index     int not null default 0,
  uploaded_at     timestamptz not null default now()
);

create table if not exists public.gift_accounts (
  id                text primary key,
  invitation_id     text not null references public.invitations(id) on delete cascade,
  type              text not null check (type in ('bank','qris','ewallet')),
  bank_name         text,
  account_number    text,
  account_name      text,
  provider          text,
  phone             text,
  qris_image_url    text,
  order_index       int not null default 0
);

-- ---------------------------------------------------------------------
-- TAMU + interaksi publik
-- ---------------------------------------------------------------------

create table if not exists public.guests (
  id              text primary key,
  invitation_id   text not null references public.invitations(id) on delete cascade,
  name            text not null,
  phone           text,
  email           text,
  guest_slug      text not null,
  invited_count   int not null default 1,
  category        text,
  table_number    text,
  notes           text,
  code            text not null,
  created_at      timestamptz not null default now(),
  unique (invitation_id, guest_slug),
  unique (invitation_id, code)
);

create table if not exists public.guest_rsvps (
  id               text primary key,
  guest_id         text not null references public.guests(id) on delete cascade,
  status           text not null default 'pending' check (status in ('pending','attending','not_attending','maybe')),
  attending_count  int not null default 0,
  meal_preference  text,
  answers          jsonb,
  special_request  text,
  responded_at     timestamptz
);

create table if not exists public.guest_messages (
  id              text primary key,
  invitation_id   text not null references public.invitations(id) on delete cascade,
  guest_id        text references public.guests(id) on delete set null,
  guest_name      text not null,
  message         text not null,
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),
  is_featured     boolean not null default false,
  created_at      timestamptz not null default now()
);

create table if not exists public.seating_tables (
  id              text primary key,
  invitation_id   text not null references public.invitations(id) on delete cascade,
  table_name      text not null,
  capacity        int not null default 10
);

create table if not exists public.checkins (
  id              text primary key,
  invitation_id   text not null references public.invitations(id) on delete cascade,
  guest_id        text not null references public.guests(id) on delete cascade,
  guest_code      text not null,
  checked_in_at   timestamptz not null default now(),
  checked_in_by   text not null
);

create table if not exists public.analytics_events (
  id              text primary key,
  invitation_id   text not null references public.invitations(id) on delete cascade,
  event_type      text not null check (event_type in ('view','rsvp','guestbook')),
  device          text,
  browser         text,
  referrer        text,
  visitor_hash    text,
  occurred_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- BILLING + notifikasi + audit + konten publik
-- ---------------------------------------------------------------------

create table if not exists public.subscriptions (
  id          text primary key,
  owner_id    text not null references public.profiles(id) on delete cascade,
  plan_id     text not null references public.plans(id),
  status      text not null check (status in ('active','expired')),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null
);

create table if not exists public.orders (
  id              text primary key,
  owner_id        text not null references public.profiles(id) on delete cascade,
  invitation_id   text references public.invitations(id) on delete set null,
  plan_id         text not null references public.plans(id),
  coupon_id       text references public.coupons(id) on delete set null,
  amount          numeric(12,0) not null default 0,
  status          text not null check (status in ('pending','paid','cancelled','refunded')),
  payment_method  text,
  created_at      timestamptz not null default now()
);

create table if not exists public.notifications (
  id          text primary key,
  user_id     text not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('rsvp','guestbook','order','system')),
  title       text not null,
  body        text not null,
  link        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id          text primary key,
  admin_id    text not null references public.profiles(id),
  action      text not null,
  entity_type text not null,
  entity_id   text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists public.testimonials (
  id          text primary key,
  name        text not null,
  role        text not null,
  avatar_url  text,
  content     text not null,
  rating      int not null default 5 check (rating between 1 and 5),
  is_active   boolean not null default true
);

create table if not exists public.faqs (
  id          text primary key,
  question    text not null,
  answer      text not null,
  order_index int not null default 0,
  is_active   boolean not null default true
);

-- ---------------------------------------------------------------------
-- TOKEN (reset sandi / verifikasi email)
-- ---------------------------------------------------------------------

create table if not exists public.password_resets (
  token      text primary key,
  email      text not null,
  expires_at timestamptz not null
);

create table if not exists public.verify_tokens (
  token      text primary key,
  email      text not null,
  expires_at timestamptz not null
);

-- ---------------------------------------------------------------------
-- META (brand/version aplikasi)
-- ---------------------------------------------------------------------

create table if not exists public.avelora_meta (
  key   text primary key,
  value text not null
);

-- ---------------------------------------------------------------------
-- ADMIN CONTROL, CONTENT, ACTIVITY, SETTINGS
-- ---------------------------------------------------------------------

alter table public.profiles add column if not exists is_banned boolean not null default false;
alter table public.profiles add column if not exists warning_count int not null default 0;
alter table public.profiles add column if not exists session_version int not null default 0;

create table if not exists public.user_activities (
  id           text primary key,
  user_id      text not null references public.profiles(id) on delete cascade,
  action       text not null,
  entity_type  text,
  entity_id    text,
  device       text,
  ip_address   text,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

create table if not exists public.broadcasts (
  id               text primary key,
  admin_id         text not null references public.profiles(id),
  title            text not null,
  body             text not null,
  target           text not null,
  recipient_count  int not null default 0,
  sent_at          timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id            text primary key,
  title         text not null,
  slug          text not null unique,
  excerpt       text not null default '',
  body          text not null default '',
  status        text not null default 'draft' check (status in ('draft','published')),
  author_id     text not null references public.profiles(id),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.content_reports (
  id            text primary key,
  reporter_id   text references public.profiles(id) on delete set null,
  entity_type   text not null,
  entity_id     text not null,
  reason        text not null,
  status        text not null default 'pending' check (status in ('pending','reviewed','dismissed')),
  created_at    timestamptz not null default now()
);

create table if not exists public.system_settings (
  key          text primary key,
  value        text not null,
  updated_by   text references public.profiles(id) on delete set null,
  updated_at   timestamptz not null default now()
);

create table if not exists public.payment_gateways (
  id           text primary key,
  provider     text not null check (provider in ('midtrans','xendit')),
  mode         text not null default 'sandbox' check (mode in ('sandbox','live')),
  public_key   text,
  secret_key   text,
  is_active    boolean not null default false,
  updated_at   timestamptz not null default now()
);

-- Storage bucket untuk asset admin. Upload dilakukan server-side via service_role.
insert into storage.buckets (id, name, public)
values ('avelora-assets', 'avelora-assets', true), ('avelora-audio', 'avelora-audio', true)
on conflict (id) do update set public = excluded.public;

-- ---------------------------------------------------------------------
-- INDEX (query umum dashboard + publik)
-- ---------------------------------------------------------------------

create index if not exists idx_invitations_owner     on public.invitations (owner_id);
create index if not exists idx_invitations_slug      on public.invitations (slug);
create index if not exists idx_invitations_category  on public.invitations (category_id);
create index if not exists idx_invitations_status    on public.invitations (status);
create index if not exists idx_schedules_inv         on public.event_schedules (invitation_id);
create index if not exists idx_gallery_inv           on public.gallery_images (invitation_id);
create index if not exists idx_guests_inv            on public.guests (invitation_id);
create index if not exists idx_guests_code           on public.guests (invitation_id, code);
create index if not exists idx_rsvps_guest           on public.guest_rsvps (guest_id);
create index if not exists idx_messages_inv_status   on public.guest_messages (invitation_id, status);
create index if not exists idx_checkins_inv          on public.checkins (invitation_id);
create index if not exists idx_analytics_inv_time    on public.analytics_events (invitation_id, occurred_at);
create index if not exists idx_gifts_inv             on public.gift_accounts (invitation_id);
create index if not exists idx_tables_inv            on public.seating_tables (invitation_id);
create index if not exists idx_subscriptions_owner   on public.subscriptions (owner_id, status);
create index if not exists idx_orders_owner          on public.orders (owner_id);
create index if not exists idx_notifications_user    on public.notifications (user_id);
create index if not exists idx_templates_cat         on public.templates (category_id);
create index if not exists idx_prs_email             on public.password_resets (email);
create index if not exists idx_vt_email              on public.verify_tokens (email);
create index if not exists idx_user_activities_user  on public.user_activities (user_id, created_at);
create index if not exists idx_broadcasts_sent       on public.broadcasts (sent_at);
create index if not exists idx_blog_posts_status     on public.blog_posts (status, published_at);
create index if not exists idx_content_reports_status on public.content_reports (status, created_at);

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- App menulis via service_role (melewati RLS). Policy dibuka untuk
-- authenticated supabase bila nanti dipakai client-side.
-- ---------------------------------------------------------------------

alter table public.profiles          enable row level security;
alter table public.event_categories  enable row level security;
alter table public.templates         enable row level security;
alter table public.music_tracks      enable row level security;
alter table public.plans             enable row level security;
alter table public.coupons           enable row level security;
alter table public.invitations       enable row level security;
alter table public.event_schedules   enable row level security;
alter table public.gallery_images    enable row level security;
alter table public.gift_accounts     enable row level security;
alter table public.guests            enable row level security;
alter table public.guest_rsvps       enable row level security;
alter table public.guest_messages    enable row level security;
alter table public.seating_tables    enable row level security;
alter table public.checkins          enable row level security;
alter table public.analytics_events  enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.orders            enable row level security;
alter table public.notifications     enable row level security;
alter table public.audit_logs        enable row level security;
alter table public.testimonials      enable row level security;
alter table public.faqs              enable row level security;
alter table public.password_resets   enable row level security;
alter table public.verify_tokens     enable row level security;
alter table public.avelora_meta      enable row level security;
alter table public.user_activities  enable row level security;
alter table public.broadcasts       enable row level security;
alter table public.blog_posts       enable row level security;
alter table public.content_reports  enable row level security;
alter table public.system_settings  enable row level security;
alter table public.payment_gateways enable row level security;

-- Policy dasar untuk autentikasi Supabase (jika dipakai client-side).
-- Aplikasi tetap memakai service_role sehingga policy ini opsional.
drop policy if exists "public content readable" on public.templates;
drop policy if exists "public content readable" on public.event_categories;
drop policy if exists "public content readable" on public.music_tracks;
drop policy if exists "public content readable" on public.plans;
drop policy if exists "public content readable" on public.testimonials;
drop policy if exists "public content readable" on public.faqs;

create policy "public content readable" on public.templates for select using (true);
create policy "public content readable" on public.event_categories for select using (true);
create policy "public content readable" on public.music_tracks for select using (true);
create policy "public content readable" on public.plans for select using (true);
create policy "public content readable" on public.testimonials for select using (true);
create policy "public content readable" on public.faqs for select using (true);