# Skill — Security Audit · Granel da Praça

## RLS — Row Level Security

- Toda tabela pública deve ter RLS habilitado no Supabase
- Leitura pública (anon): apenas categories e products com is_deleted = false
- Escrita: somente via service_role em Server Actions — nunca expor ao browser
- app_users: RLS restrito — usuário só acessa o próprio registro
- newsletter_subscriptions: INSERT permitido para anon · SELECT bloqueado

## service_role — Regra crítica

- NUNCA usar service_role no browser ou em Client Components
- service_role ignora RLS — qualquer vazamento expõe todo o banco
- getSupabaseAdmin() exclusivo em: Server Actions, Route Handlers, Server Components de admin
- NUNCA instanciar getSupabaseAdmin() no topo de módulo — sempre lazy (dentro da função)

## Validação de inputs

- Todo input de formulário validado com Zod antes de chegar ao Supabase
- Email: z.string().email()
- Quantidade granel: z.number().min(100).multipleOf(100)
- Slug: z.string().regex(/^[a-z0-9-]+$/)
- Nunca confiar em dados do cliente — validar no servidor

## Variáveis de ambiente

- NEXT_PUBLIC_* — seguro para browser, nunca colocar secrets aqui
- SUPABASE_SERVICE_ROLE_KEY — apenas server-side, nunca NEXT_PUBLIC_
- Verificar: se começa com NEXT_PUBLIC_ e contém KEY ou SECRET = vazamento crítico

## Checklist antes de cada commit

- [ ] Nenhum console.log com dados de usuário ou tokens
- [ ] Nenhum hex de chave ou secret em arquivos commitados
- [ ] getSupabaseAdmin() não está sendo chamado em Client Component
- [ ] Inputs de formulário têm validação Zod antes do insert
- [ ] Queries públicas têm .eq('is_deleted', false)
