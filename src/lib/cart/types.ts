export type ProductType = 'granel' | 'unit'

export interface CartItem {
  id: string           // product_id (uuid)
  name: string
  category: string
  productType: ProductType
  imageUrl: string | null
  priceCents: number   // preço por 100gr (granel) ou preço cheio (unit)
  incrementGrams: number // granel: 100 | unit: 0
  quantity: number     // granel: em gramas | unit: em unidades
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}
