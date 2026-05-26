# Handoff — Granel da Praça E-commerce · Sessão 26/05/2026

## 0 — ANTES DE QUALQUER AÇÃO

1. **Ler o Mapa do Projeto no Notion:**  
   `https://www.notion.so/35df86ce18e5819f9f9ad342f044931d`  
   Ele responde em 30 segundos "onde estamos" sem precisar ler o log.

2. **O Claude Code está configurado no terminal do Cursor** com `CLAUDE.md` na raiz do projeto.  
   O CLAUDE.md é a fonte de verdade para stack, schema Supabase, tokens de cor e checklist de commit.  
   Caminho: `C:\Users\Dell\Documents\projetos\granel-da-praca-e-commerce`

3. **Nunca editar de memória.** Sempre ler o arquivo antes de propor código.

---

## 1 — Estado atual do projeto

| Item | Estado |
|---|---|
| Último commit | `53c3e23` — `refactor(search-bar): migrar style inline para Tailwind e adicionar hover:bg-ghover no botao` |
| Build | ✅ limpo (zero erros TypeScript) |
| Deploy Vercel | ✅ **Em produção** — [granel-da-praca-e-commerce.vercel.app](https://granel-da-praca-e-commerce.vercel.app) · commit `a9976b7` · status Ready |
| Branch | `master` |
| Supabase | `ymjmgukuojwumvtaglyp` · São Paulo · 402 produtos · 11 categorias |
| Working tree | ✅ limpo — nenhum arquivo pendente |

---

## 2 — O que foi feito nesta sessão

- **Auditoria completa Blocos 1–9** (52 problemas identificados em 30 arquivos) — 100% resolvida
- **Refactor bloco-9b → 9g:** migração de `style` inline estático para classes Tailwind em:
  - `Navigation.tsx` — extraiu `getCategories`, trocou `getSupabaseAdmin` → `getSupabaseServer`, moveu keyframes para `tailwind.config.ts`
  - `MobileNavDrawer.tsx` — adicionou `cn()` para cores condicionais dos links
  - `Footer.tsx` — extraiu gradientes decorativos para `globals.css`
  - `NewsletterForm.tsx` — adicionou `cn()` para estados dinâmicos do botão
  - `HeroSlider.tsx` — adicionou `cn()` para dots dinâmicos
  - `ProductCard.tsx` — removeu `import tokens`, adicionou `cn()` para outline e opacity
- **Fix `CategoryGrid.tsx`:**
  - Dados hardcoded → query real no Supabase
  - Trocou `getSupabaseAdmin` → `getSupabaseServer` (rota pública)
  - Substituiu `join !inner` por duas queries independentes
  - Corrigido schema: `icon_name` → mapeamento via `SLUG_TO_ICON`
  - Corrigido token de cor: `bg-[--cream]` → `bg-cream`
  - Adicionada `CategoryGrid` à homepage
- **Criado `CLAUDE.md`** com stack, schema Supabase real, tokens DS, fluxo de trabalho e checklist de autoauditoria
- **Conectado Vercel** — deploy em produção em `granel-da-praca-e-commerce.vercel.app`
- **Refactor `SearchBar.tsx`** — migrado todos os `style` inline para Tailwind; adicionado `hover:bg-ghover` no botão Buscar

---

## 3 — Decisões arquiteturais tomadas hoje

| Decisão | Motivo |
|---|---|
| `getSupabaseAdmin()` **proibido em rotas públicas e Client Components** | `service_role` bypassa RLS — qualquer vazamento expõe todos os dados |
| `getSupabaseServer()` para Server Components com dados públicos | Usa cookies + RLS ativo — seguro para anon |
| `CategoryGrid` usa **duas queries independentes** em vez de `!inner join` | O join `!inner` falha silenciosamente se a FK estiver mal configurada; duas queries são mais robustas |
| **Soft delete:** `is_deleted = true` — nunca `DELETE` físico | Apenas na tabela `products` — `categories` não tem coluna `is_deleted` |
| `cn()` de `@/lib/utils` em **todas** as classes condicionais | Elimina `.filter(Boolean).join(' ')` e evita conflitos com `tailwind-merge` |

---

## 4 — Lições aprendidas hoje (registradas no CLAUDE.md)

### RLS policy e GRANT SELECT são duas camadas independentes no Postgres
Criar uma RLS policy **não** garante acesso à tabela. É necessário também:
```sql
-- 1. Habilitar RLS
ALTER TABLE tabela ENABLE ROW LEVEL SECURITY;

-- 2. Criar a policy
CREATE POLICY "anon pode ler tabela"
  ON tabela FOR SELECT TO anon USING (true);

-- 3. Garantir o privilégio (camada independente!)
GRANT SELECT ON tabela TO anon, authenticated;
```
Sem o `GRANT SELECT`, a tabela fica invisível para `anon` mesmo com policy criada.

### `getSupabaseAdmin` em rota pública → dados vazios sem erro
- `getSupabaseAdmin` usa `service_role` → **bypassa RLS**
- Em uma rota pública (Server Component), a query pode retornar vazio sem lançar exceção
- **Regra:** em Server Components públicos, sempre `getSupabaseServer()` — o admin fica restrito a Server Actions administrativas e Route Handlers protegidos

---

## 5 — Próximos passos (ordem correta)

### Passo 1 — Descrições de produto (script batch)
- Script Node.js que lê produtos sem `description` no Supabase
- Chama Anthropic API (Claude) para gerar descrição persuasiva por produto
- Faz `UPDATE products SET description = '...' WHERE id = '...'` em batch
- Coluna já existe no schema — só preencher

### Passo 2 — Rota `/loja`
Listagem de produtos com:
- Filtro por categoria (URL state: `?categoria=slug`)
- Busca por nome (URL state: `?q=termo`) — `SearchBar` já navega para `/loja?q=`
- Paginação (cursor ou offset)
- `ProductCard` já implementado e auditado
- Usar `getSupabaseServer()` — Server Component com Suspense

### Passo 3 — Rota `/loja/[categoria]/[slug]`
Página de detalhe do produto.

### Passo 4 — Rotas restantes
`/carrinho` → `/checkout` → `/pedido/[codigo]` → `/conta/*` → `/admin/*`

> **Lembrete `/pedido/[codigo]`:** botão "Tive um problema com meu pedido" → `https://wa.me/5534997819292` com mensagem pré-preenchida via `encodeURIComponent` contendo o código do pedido. Idem em `/conta/pedidos` por linha de pedido.

---

## 6 — Lembretes permanentes

- **Unidade de peso:** `gr` — nunca `g`, `g.`, `gram`
- **Background geral:** `bg-cream` — nunca `bg-white`
- **Preço no banco:** centavos (`int`) — exibir com `formatBRL(cents)`
- **Cálculo granel:** `price_cents / increment_grams * 100` = preço por 100 gr
- **`price_per_100g_cents` NÃO EXISTE** no schema — nunca usar em queries
- **`is_deleted` NÃO EXISTE em `categories`** — apenas em `products`
- **`sort_order`** em `categories` — não `display_order`
- **`app_users`** — nunca `profiles`
- **PowerShell 5.1** — nunca `&&`, usar `A; if ($?) { B }`
- **Cache corrompido após criar arquivo:** `npm run build:clean`

---

## 7 — Schema Supabase (fonte de verdade)

```sql
-- categories
id · name · slug · icon_url · image_url · sort_order · is_active · created_at · updated_at

-- products
id · name · slug · description · category_id · product_type · price_cents
increment_grams · compare_at_cents · unit · stock_status · is_active
is_featured · is_deleted · image_url · created_at

-- app_users | newsletter_subscriptions
```

Helpers em `src/lib/supabase/`:
- **Server Components / Actions / Route Handlers:** `getSupabaseServer()`
- **Client Components:** `getSupabase()`
- **Admin (bypass RLS):** `getSupabaseAdmin()` — NUNCA em client

---

*Projeto: `github.com/Andressadanfre/granel-da-praca-e-commerce` · Supabase: `ymjmgukuojwumvtaglyp` · Vercel: granel-da-praca-e-commerce.vercel.app · 26/05/2026*
