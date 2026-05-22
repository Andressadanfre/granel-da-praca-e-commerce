# Skill — Supabase Postgres · Granel da Praça

## Queries — Regras obrigatórias

- Sempre usar `getSupabaseServer()` de `src/lib/server.ts` em Server Components
- Sempre usar `getSupabaseAdmin()` de `src/lib/server.ts` em Server Actions e Route Handlers
- Nunca importar o client Supabase diretamente em componentes — sempre via as funções acima
- Soft delete obrigatório: `is_deleted = true` — nunca DELETE físico
- Produtos ativos = `.eq('is_deleted', false)` em toda query de listagem

## Schema — Tabelas do projeto

categories: id, name, slug, display_order, icon_name, is_deleted
products: id, name, slug, category_id, price_cents, price_per_100g_cents, product_type (granel|unit), unit (KG|UN|SC|CX|BL), is_featured, is_deleted, created_at
product_images: id, product_id, url, is_primary
app_users: id, email, name, is_deleted
newsletter_subscriptions: id, email, created_at

## Padrões de query aprovados

### Categorias com contagem de produtos
const { data } = await supabase
  .from('categories')
  .select('id, name, slug, display_order, icon_name, products!inner(count)')
  .eq('is_deleted', false)
  .eq('products.is_deleted', false)
  .order('display_order', { ascending: true })

### Produtos em destaque
const { data } = await supabase
  .from('products')
  .select('id, name, slug, price_cents, price_per_100g_cents, product_type, unit, is_featured, categories(name, slug), product_images(url, is_primary)')
  .eq('is_deleted', false)
  .eq('is_featured', true)
  .limit(4)

## Tipagem — Padrões obrigatórios

// Nunca: data as unknown as ProductRow[]
// Sempre: tipo utilitário explícito

type ProductWithCategory = Tables<'products'> & {
  categories: { name: string; slug: string } | null
  product_images: { url: string; is_primary: boolean }[]
}

type CategoryWithCount = Tables<'categories'> & {
  products: { count: number }[]
}

## Preços — Conversão obrigatória

- Banco: centavos (integer) — price_cents, price_per_100g_cents
- UI: BRL via formatBRL() de src/lib/utils.ts
- Granel: price_per_100g_cents / 100 = preço por 100gr em reais
- Unitário: price_cents / 100 = preço cheio em reais

## Proibido

- SELECT * — sempre listar colunas explicitamente
- DELETE físico — sempre soft delete
- Query sem .eq('is_deleted', false) em listagens públicas
- any ou as unknown as nos tipos retornados
