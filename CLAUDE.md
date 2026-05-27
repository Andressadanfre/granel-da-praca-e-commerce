# CLAUDE.md — Granel da Praça E-commerce

> Lido automaticamente pelo Claude Code a cada sessão.
> Fonte de verdade para decisões de arquitetura e estilo.
> Baseado em `.cursor/rules/granel-ecommerce.mdc` + Sessões 031–042.

---

## Stack

| Tecnologia | Versão | Regra |
|---|---|---|
| Next.js | 14.2.x | App Router — **nunca** Pages Router |
| Tailwind CSS | v3.4.x | **nunca** v4 |
| TypeScript | strict | zero `any`, `as any`, `@ts-ignore` |
| Supabase | `@supabase/ssr` | **nunca** `auth-helpers-nextjs` |
| Framer Motion | v12 | `ease` como `[n,n,n,n]` tuple — nunca `number[]` |

Design system próprio — **sem** shadcn/ui.

---

## Design Tokens (DS v3.1)

Todos os tokens estão mapeados em `tailwind.config.ts`. Nunca usar hex hardcoded.

### Cores

```text
Verdes da marca
  g         #00B207   CTA conversão: "Finalizar compra" · "Buscar" · "Confirmar pedido"
  gd        #2C742F   Add-to-cart nos cards do catálogo — NUNCA #00B207 aqui
  gdeep     #002603   TopBar · preços · logo · fundos escuros
  ghover    #1A5C1E   Hover único de todos os CTAs
  g-muted   #F1F8E9   Hover botão secondary
  g-light   #E8F5E9   Eyebrow pill HeroBanner · ícones leves

Backgrounds
  cream       #F9F5EF   Background geral — NUNCA branco puro (#fff)
  cream-img   #F0EBE2   Fundo da área de imagem no ProductCard
  surface     #F9FAFB   Fundo de cards e inputs

Texto
  t9   #111827   Primário
  t7   #374151   Preço/kg — contraste 9.2:1 AAA
  t6   #4B5563   Suporte
  t5   #6B7280   Preço riscado — contraste 5.74:1 AA
  t4   #9CA3AF   Labels muted · placeholder

Bordas
  bd   #E5E7EB   Bordas padrão

Badges e estados
  promo          #C0694A   Terracota — NUNCA #E65100
  promo-bg       #FBF1EE
  indigo         #3730A3   Badge "Por unidade"
  indigo-bg      #EEF2FF
  danger         #EF4444   Estoque crítico · erros
  badge-diet-bg  #EAF7EA
  badge-diet-tx  #2C742F
  badge-diet-bd  #C6E6C7
  icon-bg        #F0FDF4
  warning-bg     #FEF3C7
  warning-text   #92400E
  lime           #D4F567   Ofertas
```

### Border-radius

| Classe Tailwind | Valor | Uso |
|---|---|---|
| `rounded-input` | 8px | Inputs |
| `rounded-sel` | 10px | QuantitySelector pill |
| `rounded-inner` | 12px | Painéis e badges flutuantes |
| `rounded-modal` | 16px | Modais e drawers |
| `rounded-card` | 20px | ProductCard |
| `rounded-pill` | 100px | Badges · dots · pills |

### Shadows

| Classe | Uso |
|---|---|
| `shadow-card` | ProductCard padrão |
| `shadow-card-hover` | ProductCard ao hover |
| `shadow-drawer` | MobileNavDrawer |
| `shadow-nav` | Navigation bar |

### Regras gerais de estilo
- `stroke-width` em todos os SVGs: **1.6**
- Unidade de peso: **`gr`** — nunca `g`, `g.`, `gram`
- Background geral: `bg-cream` — nunca `bg-white`

---

## Supabase — Schema Real (confirmado Sessão 036)

> **Este schema é a fonte de verdade.** A skill antiga estava desatualizada.

### Projeto
- **ID:** `ymjmgukuojwumvtaglyp` · **Região:** São Paulo
- **Env vars:** `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY`

### `categories`

```sql
id          uuid         PK
name        text         NOT NULL
slug        text         NOT NULL UNIQUE
icon_url    text
image_url   text
sort_order  smallint     ← usa sort_order, NÃO display_order
is_active   boolean      ← usa is_active, NÃO is_deleted (não existe aqui)
created_at  timestamptz
updated_at  timestamptz
```

### `products`

```sql
id               uuid        PK
name             text        NOT NULL
slug             text        NOT NULL UNIQUE
description      text
category_id      uuid        FK → categories.id
product_type     enum        ('granel', 'unit')
price_cents      int         NOT NULL   ← preço principal em centavos
increment_grams  int                    ← granel: incremento (ex: 100)
compare_at_cents int                    ← preço original p/ desconto
unit             enum        ('KG','UN','SC','CX','BL')
stock_status     text                   ← 'in_stock' | 'low_stock' | 'out_of_stock'
is_active        boolean
is_featured      boolean
is_deleted       boolean                ← soft delete (EXISTS aqui)
image_url        text
created_at       timestamptz
```

> ❌ **NÃO EXISTE** `price_per_100g_cents` — nunca usar em queries.
> ✅ **Cálculo granel:** `price_cents / increment_grams * 100` = preço por 100gr

### `app_users`

Tabela de usuários da aplicação — **nunca** `profiles`.

### `newsletter_subscriptions`

```sql
id          uuid  PK
email       text  NOT NULL UNIQUE
created_at  timestamptz
```

### Regras Supabase

- **Nunca** instanciar client no top-level — sempre via função
- Soft delete: `is_deleted = true` em `products` — **nunca** `DELETE` físico
- Datas: `YYYY-MM-DD` no banco · `DD/MM/AAAA` na UI
- Monetário: centavos (`int`) no banco · `formatBRL(cents)` na UI

### Helpers — `src/lib/supabase/`

```typescript
// Server Components, Server Actions, Route Handlers (RLS via cookies)
import { getSupabaseServer } from '@/lib/supabase/server'

// Client Components ('use client') com ANON_KEY + RLS ativo
import { getSupabase } from '@/lib/supabase/client'

// Admin — bypass de RLS — NUNCA importar em Client Components
import { getSupabaseAdmin } from '@/lib/supabase/server'
```

---


## Seguranca de Negocio

### Calculo de preco
- Server Action recebe apenas product_id e quantity_grams
- Preco SEMPRE buscado do banco
- Total: price_cents / increment_grams * 100

### IDs publicos
- orders, payments: UUID obrigatorio
- Nunca int sequencial em URL

### Idempotencia
- Checkout usa cart_id como idempotency_key

### Cupons Race Condition
- UPDATE com RETURNING e WHERE used_count < max_uses em query unica

### IDOR
- Queries em orders filtram por user_id da sessao

### Rate limiting
- checkout: 5 req/min
- auth: 10 req/min
- coupons: 3 req/min

## Padrões de Código

### Ordem de imports

```typescript
// 1. React / framework
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 2. Libs externas
import { motion } from 'framer-motion'

// 3. Componentes internos
import { Badge } from '@/components/ui/Badge'

// 4. Tipos
import type { ProductCardProps } from '@/components/product/ProductCard'

// 5. Utils
import { cn, formatBRL } from '@/lib/utils'
```

### Estilos — regra absoluta

```tsx
// ❌ ERRADO — style inline estático
<div style={{ display: 'flex', alignItems: 'center', width: '40px', height: '40px' }} />

// ✅ CERTO — classes Tailwind
<div className="flex items-center w-10 h-10" />

// ✅ ÚNICO uso legítimo de style — valor dinâmico em runtime
<div style={{ width: `${progress}%` }} />  // vem de estado ou API
```

### Classes condicionais

```tsx
// ❌ ERRADO
className={['flex', condition && 'border-l'].filter(Boolean).join(' ')}

// ✅ CERTO — sempre cn() de @/lib/utils
className={cn('flex', condition && 'border-l')}
```

### Valores arbitrários Tailwind

```tsx
// ❌ ERRADO — arbitrário quando existe escala padrão
className="text-[14px]"  // → text-sm
className="text-[12px]"  // → text-xs

// ✅ CERTO — arbitrário apenas sem equivalente na escala
className="text-[13.5px]"
className="h-[200px]"
```

### Cores

```tsx
// ❌ ERRADO
style={{ color: '#6B7280' }}
className="text-[#6B7280]"

// ✅ CERTO — token semântico
className="text-t5"

// ✅ PERMITIDO — hex sem token, com constante documentada
// Cores da marca Google em UserMenuPopover.tsx — identidade externa, não do DS
const GOOGLE_BRAND_RED = '#EA4335'
```

### Tipagem

```tsx
// ❌ ERRADO
data as unknown as ProductRow[]
(data: any)

// ✅ CERTO
type ProductWithCategory = Tables<'products'> & { categories: { name: string } | null }
```

### Fronteira Server / Client

```tsx
// ❌ ERRADO — 'use client' desnecessário
'use client'
export function Title() { return <h1>Olá</h1> }

// ✅ CERTO — Server Component por padrão
export function Title() { return <h1>Olá</h1> }

// 'use client' APENAS para: useState · useEffect · event handlers · hooks de browser
```

### Border CSS

```tsx
// ❌ ERRADO — mistura Tailwind com style inline
className="border-t-2 border-l-2" style={{ borderBottom: '2px solid #E5E7EB' }}

// ✅ CERTO — tudo via Tailwind
className="border-b-2 border-b-bd"
```

### Entrega de código

```tsx
// ❌ ERRADO — reescrever o arquivo inteiro
// ✅ CERTO — snippet com contexto + // ... para trechos não alterados
```

---

## Arquitetura de Componentes

### QuantitySelector

- Idle: botão `+ Adicionar` · full-width · `h-10` · `bg-gd`
- Active: pill `[− | 100 gr | +]` · grid `1fr 2fr 1fr` · `px-3`
- Display central: só quantidade, **sem preço**
- Incremento granel: `100 gr` | Unidade: `1 un.`

### Cart

- localStorage key: `'granel:cart_count'`
- Eventos: `'storage'` (cross-tab) + `'cart:updated'` (same-tab)
- Atualizar badge do CartIcon:
  ```ts
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: novoCount }))
  ```

### SearchBar

- Navega para `/loja?q=` via `router.push(encodeURIComponent(termo))`

### HeroBanner / HeroSlider

- `HeroBanner.tsx` → Server Component — **não adicionar** hooks nem handlers aqui
- `HeroSlider.tsx` → Client Component — editar só o array `SLIDES` para novos slides
- Imagens em `public/images/hero/hero-0{1,2,3}.webp`
- Framer Motion: `ease` como `[n, n, n, n]` tuple tipada — **nunca** `number[]`

---

## Funções Utilitárias — `src/lib/utils.ts`

| Função | Uso |
|---|---|
| `cn(...inputs)` | clsx + tailwind-merge para classes condicionais |
| `formatBRL(cents)` | centavos → `"R$ X,XX"` |
| `formatGrams(grams)` | gramas → `"XXX gr"` (unidade `gr`, não `g`) |

Funções puras sempre **fora** do componente (topo do arquivo ou em `utils.ts`).

---

## Fluxo de Trabalho Claude Code

### Antes de qualquer ação

1. **Ler** os arquivos relevantes antes de propor código — nunca editar de memória
2. **Schema Supabase:** verificar seção acima antes de escrever qualquer query
3. **Tokens de cor:** verificar `tailwind.config.ts` antes de escolher classe

### Fluxo iterativo (padrão deste projeto)

```
Ler arquivo(s) → Diagnóstico → Aguardar aprovação → Código → Build → Commit
```

- **Nunca pular etapas** sem confirmação explícita da usuária
- **Nunca reescrever arquivos inteiros** — apenas snippets alterados
- Mostrar `git diff --staged --stat` antes de todo commit
- Executar `npm run build 2>&1` antes de todo commit — **zero erros TypeScript**

### Commits

```
Formato:  tipo(escopo): descrição em português
Autor:    Andressadanfre
Tipos:    feat · fix · refactor · chore · docs
Exemplo:  feat(loja): adicionar filtro por categoria com URL state
```

Nunca commitar com build quebrado.

### PowerShell

- Terminal: PowerShell 5.1 — nunca bash/sh
- Encadeamento: `A; if ($?) { B }` — `&&` não existe no PS 5.1
- Cache corrompido após criar arquivo: `npm run build:clean`
- Dev server travado: `taskkill /F /IM node.exe` → `Remove-Item -Recurse -Force .next` → `npm run dev`

---

## Checklist de Autoauditoria — Antes de Todo Commit

### Código geral
- [ ] Zero `console.log/error/warn` — `Select-String -r "console\." src/`
- [ ] Zero `as any`, `as unknown as` — `Select-String "as any" src/`
- [ ] Zero `@ts-ignore`, `@ts-expect-error` sem comentário explicando
- [ ] Zero `style` prop com valor estático (migrado para classes Tailwind)
- [ ] Todas as classes condicionais usam `cn()` — zero `.filter(Boolean).join(' ')`
- [ ] Nenhum hex hardcoded novo fora de `tailwind.config.ts`

### Supabase
- [ ] Nenhuma query usa `price_per_100g_cents` (não existe)
- [ ] Nenhuma query usa `is_deleted` em `categories` (não existe na tabela)
- [ ] Nenhum `getSupabaseAdmin()` importado em arquivo `'use client'`
- [ ] Soft delete usa `is_deleted = true` — nunca `DELETE FROM`

### Next.js / Tailwind
- [ ] `'use client'` só existe onde há `useState`/`useEffect`/event handlers
- [ ] `next/image` em todas as imagens — zero `<img>` puro
- [ ] Sem classes conflitantes no mesmo elemento (`font-semibold` + `font-bold` etc.)
- [ ] Sem `border` shorthand misturado com `style={{ border... }}`

### Git
- [ ] `npm run build 2>&1` → zero erros · zero warnings TypeScript
- [ ] `git diff --staged --stat` → apenas os arquivos esperados estão no stage

---

## Estado do Projeto — 26/05/2026

### Infraestrutura
- **Repo:** `github.com/Andressadanfre/granel-da-praca-e-commerce`
- **Pasta:** `C:\Users\Dell\Documents\projetos\granel-da-praca-e-commerce`
- **Supabase:** `ymjmgukuojwumvtaglyp` · São Paulo · 402 produtos · 11 categorias
- **Build:** ✅ limpo
- **Auditoria 20/05/2026:** ✅ 100% concluída (Blocos 1–9)

### Rotas

| Rota | Status |
|---|---|
| `/` | ✅ Homepage completa |
| `/loja` | 🔴 Pendente |
| `/loja/[categoria]/[slug]` | 🔴 Pendente |
| `/carrinho` | 🔴 Pendente |
| `/checkout` | 🔴 Pendente |
| `/pedido/[codigo]` | 🔴 Pendente |
| `/conta/*` | 🔴 Pendente |
| `/admin/*` | 🔴 Pendente |

### Próximas entregas (prioridade)
1. **Vercel** — conectar repo `granel-da-praca-e-commerce` (apagar projeto antigo manualmente)
2. **Descrições de produto** — script batch Node.js + Anthropic API → coluna `description` no Supabase
3. **`/loja`** — listagem com filtro de categoria, busca, paginação

### Lembrete `/pedido/[codigo]`
Ao implementar: botão "Tive um problema com meu pedido" → `https://wa.me/5534997819292`
com mensagem pré-preenchida via `encodeURIComponent` contendo o código do pedido.
Idem em `/conta/pedidos` por linha de pedido.

---

## Lições Permanentes

| Erro cometido | Solução correta |
|---|---|
| `pr-12` em `overflow-x-auto` não garante padding no fim do scroll | Spacer `shrink-0` inline ou remover o elemento conflitante |
| Schema desatualizado → query com campo errado | Verificar seção Supabase neste arquivo antes de escrever queries |
| `console.log` de diagnóstico esquecido no commit | `Select-String "console.log" src/` antes de `git add` |
| `style` inline com valor estático | Converter para classes Tailwind — `style` só para valores dinâmicos |
| `text-[14px]` quando existe `text-sm` | Verificar escala Tailwind antes de usar valor arbitrário `[N]` |
| Array `.filter(Boolean).join(' ')` para classes | Sempre `cn()` de `@/lib/utils` |
| Cache corrompido do webpack após criar arquivo | `npm run build:clean` — nunca `npm run build` após criar/mover arquivos |
| `missing required error components` no dev | `taskkill /F /IM node.exe` + `Remove-Item -Recurse -Force .next` + `npm run dev` |
| Import default vs named export | `Select-String "^export"` no arquivo antes de importar em `page.tsx` |
| `poppins.variable` no `<html>` não aplica a fonte | `poppins.className` no `<body>` — `.variable` só expõe o CSS var |
| `pt-[195px]` no `<main>` com Navigation sticky | Navigation é `sticky` — `<main>` não precisa de compensação |
| Commit vazio (blob `e69de29`) | `git diff --staged --stat` antes de todo commit |
| `@supabase/auth-helpers-nextjs` | Usar `@supabase/ssr` |
| Badge com `number` como children direto | Template literal `` `${n}% OFF` `` — nunca JSX com number diretamente |
| RLS policy sem `GRANT SELECT` — tabela pública invisível para `anon` | RLS policy e `GRANT SELECT` são duas camadas independentes no Postgres. Após criar qualquer tabela pública: (1) `CREATE POLICY ... USING (...)`, (2) `GRANT SELECT ON tabela TO anon, authenticated` |
