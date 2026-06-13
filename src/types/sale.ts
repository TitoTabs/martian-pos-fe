export type PaymentMethod = 'cash' | 'gcash' | 'card'
export type OrderType = 'dine_in' | 'take_out'
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed'

export interface SaleItemAddon {
  id: number
  addon_id: number
  addon_name: string
  price: number
}

export interface SaleItem {
  id: number
  product_id: number
  product_name: string
  unit_price: number
  quantity: number
  line_total: number
  addons: SaleItemAddon[]
}

export interface Sale {
  id: number
  subtotal: number
  total: number
  payment_method: PaymentMethod
  customer_name: string
  order_type: OrderType
  notes: string | null
  status: OrderStatus
  items: SaleItem[]
  created_at: string
}

export interface SalePayload {
  customer_name: string
  order_type: OrderType
  notes?: string
  payment_method: PaymentMethod
  items: {
    product_id: number
    quantity: number
    addon_ids: number[]
  }[]
}
