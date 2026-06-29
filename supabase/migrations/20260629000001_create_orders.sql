-- =============================================================
-- A0 — orders + order_items + admin_users + admin_audit_log
-- 29/06/2026 · Fase 5A/5B
-- Índices em migration separada A0-indexes (CONCURRENTLY)
-- =============================================================

-- ─── ENUMS ───────────────────────────────────────────────────

create type public.order_status as enum (
  'recebido',
  'aceito',
  'em_separacao',
  'saiu_para_entrega',
  'pronto_para_retirada',
  'entregue',
  'retirado',
  'cancelado'
);

create type public.order_delivery_type as enum (
  'entrega',
  'retirada'
);

create type public.payment_method as enum (
  'pix',
  'cartao_credito',
  'cartao_debito',
  'dinheiro',
  'alelo'
);

create type public.admin_role as enum (
  'owner',
  'supervisora'
);

-- ─── SEQUENCE ────────────────────────────────────────────────

create sequence public.orders_code_seq start 1;

-- ─── ADMIN USERS ─────────────────────────────────────────────

create table public.admin_users (
  id         uuid              not null default gen_random_uuid(),
  user_id    uuid              not null,
  role       public.admin_role not null default 'supervisora',
  is_active  boolean           not null default true,
  created_at timestamptz       not null default now(),
  updated_at timestamptz       not null default now(),
  constraint admin_users_pkey
    primary key (id),
  constraint admin_users_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade,
  constraint admin_users_user_id_unique
    unique (user_id)
);

comment on table  public.admin_users is
  'Usuários com acesso ao painel admin — roles: owner (Andressa) | supervisora';
comment on column public.admin_users.role is
  'owner = acesso irrestrito | supervisora = pedidos, produtos, clientes';

-- ─── ORDERS ──────────────────────────────────────────────────

create table public.orders (
  id               uuid                       not null default gen_random_uuid(),
  code             text                       not null default '',
  tracking_token   text                       not null default encode(gen_random_bytes(16), 'hex'),
  user_id          uuid,
  delivery_type    public.order_delivery_type not null,
  status           public.order_status        not null default 'recebido',
  payment_method   public.payment_method      not null,
  payment_status   text                       not null default 'pendente'
                     check (payment_status in (
                       'pendente', 'pago', 'falhou', 'reembolsado'
                     )),
  mp_payment_id    text,
  subtotal_cents   integer                    not null check (subtotal_cents   >= 0),
  shipping_cents   integer                    not null default 0 check (shipping_cents >= 0),
  discount_cents   integer                    not null default 0 check (discount_cents >= 0),
  total_cents      integer                    not null check (total_cents      >= 0),
  coupon_id        uuid,
  delivery_address jsonb,
  customer_name    text,
  customer_phone   text,
  customer_email   text,
  notes            text,
  cancelled_reason text,
  cancelled_by     uuid,
  cancelled_at     timestamptz,
  is_deleted       boolean                    not null default false,
  created_at       timestamptz                not null default now(),
  updated_at       timestamptz                not null default now(),
  constraint orders_pkey
    primary key (id),
  constraint orders_code_unique
    unique (code),
  constraint orders_tracking_token_unique
    unique (tracking_token),
  constraint orders_user_id_fkey
    foreign key (user_id) references public.app_users (id) on delete set null,
  constraint orders_cancelled_by_fkey
    foreign key (cancelled_by) references auth.users (id) on delete set null
);

comment on table  public.orders is
  'Pedidos do e-commerce — status bifurcado por delivery_type';
comment on column public.orders.code is
  'Código legível — ex: GP0001. Gerado pelo trigger set_order_code';
comment on column public.orders.tracking_token is
  'Token hex 32 chars — link de rastreamento público. Nunca expor o code sequencial';
comment on column public.orders.delivery_address is
  'Snapshot do endereço no momento do pedido — imutável após criação';
comment on column public.orders.coupon_id is
  'FK para coupons — adicionada na migration A0B. Nullable sem FK por ora';
comment on column public.orders.cancelled_reason is
  'Obrigatório ao cancelar após em_separacao — registrado também no audit_log';
comment on column public.orders.payment_method is
  'pix/cartao_credito/cartao_debito = Mercado Pago online | dinheiro/alelo = pago na entrega';

-- ─── TRIGGER — código do pedido ──────────────────────────────

create or replace function public.generate_order_code()
returns trigger as $$
begin
  new.code := 'GP' || lpad(nextval('public.orders_code_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger set_order_code
  before insert on public.orders
  for each row
  when (new.code is null or new.code = '')
  execute function public.generate_order_code();

-- ─── ORDER ITEMS ─────────────────────────────────────────────

create table public.order_items (
  id                   uuid                not null default gen_random_uuid(),
  order_id             uuid                not null,
  product_id           integer             not null,
  product_name         text                not null,
  product_code         text,
  product_type         public.product_type not null,
  price_cents_snapshot integer             not null check (price_cents_snapshot >= 0),
  quantity_grams       integer,
  quantity_units       integer,
  item_total_cents     integer             not null check (item_total_cents >= 0),
  is_separated         boolean             not null default false,
  separated_at         timestamptz,
  constraint order_items_pkey
    primary key (id),
  constraint order_items_order_id_fkey
    foreign key (order_id) references public.orders (id) on delete cascade,
  constraint order_items_product_id_fkey
    foreign key (product_id) references public.products (id) on delete restrict,
  constraint order_items_quantity_check check (
    (product_type = 'granel'
      and quantity_grams is not null
      and quantity_grams > 0)
    or
    (product_type = 'unit'
      and quantity_units is not null
      and quantity_units > 0)
  )
);

comment on table  public.order_items is
  'Itens do pedido — snapshots congelados no momento da compra';
comment on column public.order_items.price_cents_snapshot is
  'Preço no momento da compra — nunca atualizar mesmo se produto mudar';
comment on column public.order_items.product_name is
  'Nome no momento da compra — snapshot para histórico';
comment on column public.order_items.is_separated is
  'Marcado pela supervisora no cupom 80mm — dispara atualização de status do pedido';
comment on column public.order_items.quantity_grams is
  'Granel: múltiplo de 100. NULL para unitário';
comment on column public.order_items.quantity_units is
  'Unitário: inteiro positivo. NULL para granel';

-- ─── ADMIN AUDIT LOG ─────────────────────────────────────────

create table public.admin_audit_log (
  id         uuid        not null default gen_random_uuid(),
  user_id    uuid        not null,
  action     text        not null,
  entity     text        not null,
  entity_id  text        not null,
  old_value  jsonb,
  new_value  jsonb,
  reason     text,
  created_at timestamptz not null default now(),
  constraint admin_audit_log_pkey
    primary key (id),
  constraint admin_audit_log_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete restrict
);

comment on table  public.admin_audit_log is
  'Registro imutável de ações admin — nunca deletar registros';
comment on column public.admin_audit_log.reason is
  'Obrigatório: cancelamento após em_separacao e ajuste manual de pontos';
comment on column public.admin_audit_log.action is
  'Ex: status_changed | price_updated | product_deactivated | points_adjusted';

-- ─── RLS ─────────────────────────────────────────────────────

alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.admin_users     enable row level security;
alter table public.admin_audit_log enable row level security;

create policy orders_select_own
  on public.orders for select
  to authenticated
  using (user_id = auth.uid());

create policy orders_select_by_token
  on public.orders for select
  to anon
  using (true);

create policy order_items_select_own
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id      = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy order_items_select_by_token
  on public.order_items for select
  to anon
  using (true);

create policy admin_users_select_own
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

create policy audit_log_admin_only
  on public.admin_audit_log for select
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id   = auth.uid()
        and admin_users.is_active = true
    )
  );

-- ─── GRANTS ──────────────────────────────────────────────────

grant select on public.orders          to anon, authenticated;
grant select on public.order_items     to anon, authenticated;
grant select on public.admin_users     to authenticated;
grant select on public.admin_audit_log to authenticated;
grant usage  on sequence public.orders_code_seq to authenticated;
