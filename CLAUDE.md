# CLAUDE.md — Granel da Praça E-commerce

> Lido automaticamente a cada sessão. Contém APENAS invariantes do projeto.
> Estado de implementação NUNCA vive aqui — desatualiza e gera divergência.

---

## Identidade e Stack

E-commerce próprio da Granel da Praça — produtos naturais a granel desde 2019, duas unidades em Uberlândia, MG. Substituirá o Goomer e o site institucional no lançamento.

| Tecnologia | Versão | Regra |
|---|---|---|
| Next.js | 14.2.x | App Router — **nunca** Pages Router |
| Tailwind CSS | v3.4.x | **nunca** v4 |
| TypeScript | strict | zero `any`, `as any`, `@ts-ignore` |
| Supabase | `@supabase/ssr` | **nunca** `auth-helpers-nextjs` |
| Framer Motion | v12 | `ease` como `[n,n,n,n]` tuple — nunca `number[]` |

- Design system próprio (DS v3.1) — **sem** shadcn/ui. Tokens em `tailwind.config.ts` e `.cursor/rules/granel-ecommerce.mdc`.
- Gateway de pagamento DEFINITIVO: **Mercado Pago**. Referências a "Asaas" em docs antigos estão erradas — ignorar.
- Admin em `src/app/admin/` (sem route group) no **mesmo** projeto — parênteses removeriam o prefixo `/admin` da URL e quebrariam o middleware RBAC. Decisão fechada.

---

## Hierarquia de Verdade

| Assunto | Fonte de verdade |
|---|---|
| Schema do banco | `supabase/migrations/` (baseline `20260626000000`) + verificação via Supabase MCP |
| Estado de implementação, fases, pendências | **Topo do log no Notion Mapa do Projeto — nunca este arquivo** |
| Layout visual | HTML aprovado em `html-referencias/` — sem HTML aprovado, não implementar |
| Marketing, analytics, runbooks de lançamento | Notion (Módulos 5 e 7 · página Site Institucional & Marketing) |
| Segurança (specs completas) | `.cursor/rules/granel-security.mdc` |
| Design, domínio e-commerce, padrões Next.js | `.cursor/rules/granel-ecommerce.mdc` |
| Componentes existentes | `git ls-files` — nunca inventário em documento |

---

## Regras Críticas

### Fórmula de preço — COMPLETA (fonte do erro 10x)

- `products.price_cents` = preço por **KG** em centavos. Não existe `price_per_100g_cents` — nunca usar.
- **Total do item (centavos):** `Math.round(price_cents * quantity_grams / 1000)`
- **Preço exibido por 100 gr:** `Math.round(price_cents / 10)` — dividir por 100 gera o **erro 10x** já cometido neste projeto.
- `increment_grams` é **APENAS** o step do QuantitySelector (100 granel / 1 unit). **NUNCA** é divisor de preço — usá-lo no cálculo é a outra forma do erro 10x. Seu único papel server-side é validação de múltiplo: `quantity_grams % increment_grams === 0`.
- Preço SEMPRE recalculado server-side a partir do banco — nunca aceitar preço do body da requisição.

### Shipping cost — CRITICAL (bug duplicado em 3 arquivos, 13/07)

- Qualquer cálculo de frete deve checar `deliveryType === 'retirada'` → 0.
- **NUNCA** duplicar a fórmula em múltiplos arquivos (`actions.ts`, `OrderSummaryPanel.tsx`, `schemas.ts` já tiveram cópias divergentes).
- `calcFreteServer` deve ser a única fonte de verdade — considerar exigir `deliveryType` como parâmetro obrigatório.

### Mercado Pago auto_return

- Obrigatório `'approved'` condicional a `appUrl.startsWith('https')` — MP rejeita `auto_return` com `back_url` localhost.
- Só dispara redirect automático para pagamento aprovado com **CARTÃO** — Pix nunca aciona, é comportamento nativo do MP, não bug.

### Mercado Pago produção — CRITICAL

- Prefixo `APP_USR-` no token **NÃO** garante que a conta está habilitada para transações reais.
- Confirmar sempre via painel de desenvolvedor (developers panel → Credenciais de produção) que o formulário de ativação (setor + site + termos) foi completado.
- Sintoma de conta não ativada: erro `'uma das partes é de teste'` mesmo com cartão real.

### Padrões Supabase

- Projeto: `ymjmgukuojwumvtaglyp` (São Paulo). Env vars: `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY`.
- Helpers — nunca instanciar client no top-level:
  - `getSupabaseServer()` de `@/lib/supabase/server` — Server Components, Server Actions, Route Handlers
  - `getSupabase()` de `@/lib/supabase/client` — Client Components
  - `getSupabaseAdmin()` de `@/lib/supabase/server` — bypass RLS, **nunca** em Client Components ou rotas públicas
- Tabela de usuários: `app_users` — **nunca** `profiles`.
- Campos que **NÃO EXISTEM** (proibido inventar): `image_url` em `products` (fotos em `product_images`) · `price_per_100g_cents` · `is_deleted` em `categories` (usa `is_active`) · `display_order` (usa `sort_order`).
- Soft delete: `is_deleted = true` em `products` — nunca `DELETE` físico.
- Datas: `YYYY-MM-DD` no banco · `DD/MM/AAAA` na UI. Monetário: centavos (`int`) no banco · `formatBRL(cents)` na UI.
- IDs internos de `categories`/`products` são `integer serial`; `orders`/`payments` expostos em URL são UUID.
- Após migration via MCP: regenerar `src/types/database.ts` com `npx supabase gen types typescript --project-id ymjmgukuojwumvtaglyp --schema public` (preservar helper `Tables<T>`).
- Verificar schema via MCP antes de escrever qualquer query.

### Fronteiras Server/Client (RSC)

- Server Component por padrão — `'use client'` **apenas** para `useState`/`useEffect`/event handlers/browser APIs.
- `getSupabaseAdmin()` jamais importado em arquivo `'use client'`.
- Mutações autenticadas: Server Actions — nunca Route Handlers.
- Identidade sempre via `supabase.auth.getUser()` no servidor — nunca `user_id` vindo do cliente. Queries sensíveis incluem `.eq('user_id', user.id)`.

---

## Workflow de Desenvolvimento

### Fluxo iterativo (padrão deste projeto)

```
Ler arquivo(s) → Diagnóstico → Aguardar aprovação → Código → Build → Commit
```

- Ler os arquivos alvo em disco antes de propor código — nunca editar de memória.
- Nunca reescrever arquivos inteiros — apenas snippets alterados.
- Nunca inventar layout — todo componente visual parte do HTML aprovado em `html-referencias/`.
- Mostrar diff para aprovação antes de `git add`.
- `npm run build 2>&1` antes de todo commit — zero erros TypeScript.

### Proibido sem aprovação explícita

- Criar/alterar arquivos em `supabase/migrations/`
- SQL destrutivo (`DELETE`, `DROP`, `TRUNCATE`) · `UPDATE`/`DELETE` sem `WHERE`
- Instalar novas dependências
- Commitar com build quebrado

### Commits

```
Formato:  tipo(escopo): descrição em português
Autor:    Andressadanfre
Tipos:    feat · fix · refactor · chore · docs
Exemplo:  feat(loja): adicionar filtro por categoria com URL state
```

`git diff --staged --stat` antes de todo commit — apenas os arquivos esperados no stage.

---

## Code Standards

- Estilos: classes Tailwind sempre — `style` prop **apenas** para valores dinâmicos de runtime (ex: `width: ${progress}%`).
- Cores: token semântico (`text-t5`) — nunca hex hardcoded nem `text-[#...]`. Hex sem token: constante nomeada e documentada.
- Escala Tailwind antes de valor arbitrário: `text-sm`, não `text-[14px]`.
- Classes condicionais: sempre `cn()` de `@/lib/utils` — nunca `.filter(Boolean).join(' ')`.
- Zero `console.*` commitado — usar `logger` de `src/lib/logger.ts`.
- `next/image` obrigatório — nunca `<img>` puro.
- Imports: React/framework → libs externas → componentes internos → tipos → utils.
- Funções puras fora do componente (`formatBRL`, `formatGrams` em `src/lib/utils.ts`).
- Unidade de peso: `gr` — nunca `g` ou `gram`.
- Error handling: Server Actions retornam `{ success, error }` tipado — nunca expor `error.message`/stack ao cliente.

---

## PowerShell (terminal deste projeto)

- PowerShell 5.1 — nunca bash/sh. Encadeamento: `A; if ($?) { B }` — `&&` não existe no PS 5.1.
- `distDir` separado por ambiente (`next.config.mjs`): dev escreve em `.next-dev`, build/produção em `.next`. `npm run dev` e `npm run build` convivem em paralelo sem corromper cache — não é mais necessário matar o dev server antes de buildar.
- Cache corrompido por outro motivo (ex: processo zumbi preso na porta): `npm run build:clean` ou `taskkill /F /IM node.exe` → `Remove-Item -Recurse -Force .next`/`.next-dev` → `npm run dev`.

---

## Checklist Pré-Commit

- [ ] Zero `console.*` — `Select-String -r "console\." src/` (ok para ASCII puro; não confiável em conteúdo acentuado — usar `Get-Content -Raw`)
- [ ] Zero `as any` / `as unknown as` / `@ts-ignore` sem justificativa
- [ ] Zero `style` estático · classes condicionais via `cn()` · zero hex novo fora de `tailwind.config.ts`
- [ ] Nenhuma query com campos inexistentes (`price_per_100g_cents`, `image_url` em products, `is_deleted` em categories)
- [ ] Nenhum `getSupabaseAdmin()` em arquivo `'use client'`
- [ ] `'use client'` só onde há interatividade real · `next/image` em todas as imagens
- [ ] `npm run build 2>&1` → zero erros · `git diff --staged --stat` → apenas arquivos esperados

---

## Ponteiros

| Recurso | Identificador |
|---|---|
| Supabase project | `ymjmgukuojwumvtaglyp` (São Paulo) |
| Vercel team | `team_n2LeQBoo0SJSpN5VZ1zRwfZc` (andressadanfres-projects) |
| Notion — 🗺️ 00 Mapa do Projeto | `35df86ce-18e5-81f2-9f9a-d342f044931d` |
| Notion — Framework E-commerce 2026 | `33bf86ce-18e5-815f-892f-c82b14a5b870` |
| Notion — Site Institucional & Marketing | `343f86ce-18e5-8102-b577-d0f562c5b10e` |
| GA4 | `G-C6W30XMXN3` · propriedade 491153641 — **nunca criar nova** |
| Meta Pixel | `2291807841017792` — **nunca criar novo** |
| Google Ads | conta 760-664-9903 · conversão AW-763361661 |
| UTM taxonomy | Google: `utm_source=google&utm_medium=cpc&utm_campaign=fundinho\|umc` · Meta: `utm_source=meta&utm_medium=paid_social` — nunca criar padrão novo |
| WhatsApp Fundinho | (34) 99781-9292 · Praça Clarimundo Carneiro, 119 |
| WhatsApp UMC (quiosque, sem retirada) | (34) 99796-9191 · Rua Rafael Marino Neto, 600 |
| Site institucional (provisório) | www.graneldapraca.com.br · repo `Andressadanfre/graneldapraca-landing` |

**Estado atual de implementação: ver topo do log no Notion Mapa do Projeto — nunca este arquivo.**
