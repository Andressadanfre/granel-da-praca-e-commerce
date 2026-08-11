import type { Database } from './database'

/**
 * Tipos de domínio de produto.
 * ProductType e ProductUnit derivam dos enums gerados — sincronizam sozinhos
 * quando `supabase gen types` roda.
 * StockStatus é union manual: no banco é coluna text com CHECK constraint,
 * não enum Postgres, então o gerador emite `string`.
 */
export type ProductType = Database['public']['Enums']['product_type']
export type ProductUnit = Database['public']['Enums']['product_unit']
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'
