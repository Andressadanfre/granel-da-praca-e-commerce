-- Migration: add_ga_client_id_to_orders
-- Aplicada em produção via MCP Supabase em 29/09/2026 (projeto ymjmgukuojwumvtaglyp).
-- Este arquivo é o registro local dessa mudança — o schema já reflete isso
-- em produção, este arquivo só resolve o drift entre banco real e
-- histórico versionado (ver nota em technical-invariants.md sobre migrations
-- ausentes do repositório local).
--
-- Contexto: Fase 3 do tracking de atribuição (evento de compra GA4 + Meta).
-- Adiciona a coluna que faltava para o GA4 conseguir ligar o evento de
-- compra à sessão que originou a venda (client_id do cookie _ga).

alter table public.orders add column ga_client_id text;

create or replace function public.create_order_with_items(
  p_user_id uuid,
  p_delivery_type order_delivery_type,
  p_payment_method payment_method,
  p_subtotal_cents integer,
  p_shipping_cents integer,
  p_discount_cents integer,
  p_total_cents integer,
  p_delivery_address jsonb default null,
  p_customer_name text default null,
  p_customer_phone text default null,
  p_customer_email text default null,
  p_notes text default null,
  p_items jsonb default '[]'::jsonb,
  p_gclid text default null,
  p_fbc text default null,
  p_fbp text default null,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_utm_content text default null,
  p_utm_term text default null,
  p_channel_origin text default null,
  p_ga_client_id text default null
)
returns table(id uuid, code text)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_order_id uuid;
  v_order_code text;
begin
  if auth.uid() is not null and p_user_id is distinct from auth.uid() then
    raise exception 'p_user_id não corresponde ao usuário autenticado';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'p_items não pode ser vazio';
  end if;

  insert into public.orders (
    user_id, delivery_type, payment_method,
    subtotal_cents, shipping_cents, discount_cents, total_cents,
    delivery_address, customer_name, customer_phone, customer_email, notes,
    gclid, fbc, fbp, utm_source, utm_medium, utm_campaign, utm_content, utm_term, channel_origin,
    ga_client_id
  ) values (
    p_user_id, p_delivery_type, p_payment_method,
    p_subtotal_cents, p_shipping_cents, p_discount_cents, p_total_cents,
    p_delivery_address, p_customer_name, p_customer_phone, p_customer_email, p_notes,
    p_gclid, p_fbc, p_fbp, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term, p_channel_origin,
    p_ga_client_id
  )
  returning orders.id, orders.code into v_order_id, v_order_code;

  insert into public.order_items (
    order_id, product_id, product_name, product_type,
    price_cents_snapshot, quantity_grams, quantity_units, item_total_cents
  )
  select
    v_order_id,
    (item->>'product_id')::integer,
    item->>'product_name',
    (item->>'product_type')::product_type,
    (item->>'price_cents_snapshot')::integer,
    (item->>'quantity_grams')::integer,
    (item->>'quantity_units')::integer,
    (item->>'item_total_cents')::integer
  from jsonb_array_elements(p_items) as item;

  return query select v_order_id, v_order_code;
end;
$function$;
