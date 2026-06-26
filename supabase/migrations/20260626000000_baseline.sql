-- =============================================================
-- BASELINE MANUAL — 26/06/2026 (Sessão 053)
-- Schema real de produção ymjmgukuojwumvtaglyp
-- Gerado manualmente: Docker ausente (db pull requer Docker)
-- 8 migrations anteriores reconciliadas via migration repair
-- =============================================================

-- ENUMS
create type public.product_type as enum ('granel', 'unit');

-- TABELAS
create table public.app_users (
  id          uuid        not null,
  full_name   text,
  phone       text,
  cpf         text,
  birth_date  date,
  is_active   boolean     not null default true,
  is_deleted  boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint app_users_pkey primary key (id)
);

create table public.categories (
  id          integer     not null default nextval('categories_id_seq'::regclass),
  name        text        not null,
  slug        text        not null,
  description text,
  icon_name   text,
  sort_order  smallint    not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint categories_pkey primary key (id)
);

create table public.products (
  id               integer           not null,
  category_id      integer,
  name             text,
  slug             text,
  description      text,
  unit             text,
  product_type     public.product_type,
  price_cents      integer,
  compare_at_cents integer,
  increment_grams  integer,
  is_active        boolean,
  is_featured      boolean,
  is_deleted       boolean,
  stock_status     text,
  created_at       timestamptz,
  updated_at       timestamptz,
  constraint products_pkey primary key (id)
);

create table public.product_images (
  id          integer     not null default nextval('product_images_id_seq'::regclass),
  product_id  integer     not null,
  url         text        not null,
  alt         text,
  sort_order  smallint    not null default 0,
  is_primary  boolean     not null default false,
  created_at  timestamptz not null default now(),
  constraint product_images_pkey primary key (id)
);

create table public.newsletter_subscriptions (
  id         uuid        not null default gen_random_uuid(),
  email      text        not null,
  created_at timestamptz not null default now(),
  source     text        not null default 'footer',
  constraint newsletter_subscriptions_pkey primary key (id)
);

-- RLS
alter table public.categories               enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.product_images           enable row level security;
alter table public.products                 enable row level security;

-- POLICIES
create policy categories_public_select
  on public.categories for select
  to anon, authenticated
  using (is_active = true);

create policy allow_public_insert
  on public.newsletter_subscriptions for insert
  to anon
  with check (true);

create policy product_images_public_read
  on public.product_images for select
  to public
  using (true);

create policy products_public_select
  on public.products for select
  to anon, authenticated
  using (is_active = true and is_deleted = false);

-- GRANTS
grant select on public.categories     to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant select on public.products       to anon, authenticated;