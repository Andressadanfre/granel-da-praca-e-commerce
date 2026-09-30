-- Migration: drop_legacy_create_order_with_items_overload_v2
-- Aplicada em produção via MCP Supabase em 29/09/2026 (projeto ymjmgukuojwumvtaglyp).
-- Este arquivo é o registro local dessa mudança — o schema já reflete isso
-- em produção, este arquivo só resolve o drift entre banco real e
-- histórico versionado (ver nota em technical-invariants.md sobre migrations
-- ausentes do repositório local).
--
-- Nota: corrige, no mesmo ciclo de add_ga_client_id_to_orders, um overload
-- duplicado de create_order_with_items criado por engano ao aplicar a
-- mudança (mesmo padrão de incidente já visto na Fase 1A, 16/09/2026) —
-- a versão antiga da função (sem p_ga_client_id) foi removida com
-- DROP FUNCTION usando a assinatura de tipos exata, e só a versão nova
-- permanece no banco.

-- Remove o overload duplicado (sem p_ga_client_id) criado pelo CREATE OR
-- REPLACE de add_ga_client_id_to_orders — assinatura de tipos exata da
-- versão antiga, 21 parâmetros.
drop function if exists public.create_order_with_items(
  uuid, order_delivery_type, payment_method, integer, integer, integer, integer,
  jsonb, text, text, text, text, jsonb, text, text, text, text, text, text, text, text, text
);
