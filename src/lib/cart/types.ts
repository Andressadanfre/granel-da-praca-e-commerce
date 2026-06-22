export type ProductType = 'granel' | 'unit'

export interface CartItem {
  id: number           // product_id (integer serial)
  name: string
  category: string
  productType: ProductType
  imageUrl: string | null
  priceCents: number   // preço por 100gr (granel) ou preço cheio (unit)
  incrementGrams: number // granel: 100 | unit: 0
  quantity: number     // granel: em gramas | unit: em unidades
}

export type ProductForCart = Omit<CartItem, 'quantity'>

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}
