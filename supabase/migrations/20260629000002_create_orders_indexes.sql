-- =============================================================
-- A0-indexes — índices das tabelas de orders
-- Tabelas vazias no momento da criação — sem risco de lock
-- CONCURRENTLY não suportado pelo apply_migration (transaction block)
-- Em produção com dados: recriar via CONCURRENTLY fora de transação
-- 29/06/2026
-- =============================================================

create index if not exists idx_orders_user_id
  on public.orders (user_id);

create index if not exists idx_orders_status
  on public.orders (status);

create index if not exists idx_orders_created_at
  on public.orders (created_at desc);

create index if not exists idx_orders_tracking_token
  on public.orders (tracking_token);

create index if not exists idx_order_items_order_id
  on public.order_items (order_id);

create index if not exists idx_order_items_product_id
  on public.order_items (product_id);

create index if not exists idx_audit_log_entity
  on public.admin_audit_log (entity, entity_id);

create index if not exists idx_audit_log_user_id
  on public.admin_audit_log (user_id);

create index if not exists idx_audit_log_created_at
  on public.admin_audit_log (created_at desc);
