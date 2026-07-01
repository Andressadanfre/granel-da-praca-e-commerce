-- app_users nao tinha RLS nem policies desde a baseline.
-- Escrita continua exclusiva de service_role (ensureAppUser via getSupabaseAdmin) —
-- authenticated so le/edita a propria linha.

alter table public.app_users enable row level security;

-- POLICIES
create policy app_users_select_own
  on public.app_users for select
  to authenticated
  using (auth.uid() = id);

create policy app_users_update_own
  on public.app_users for update
  to authenticated
  using (auth.uid() = id);

-- GRANTS
grant select, update on public.app_users to authenticated;
