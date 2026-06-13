export interface Addon {
  id: number
  name: string
  price: number
  inventory_item_id: number | null
  inventory_item_name?: string | null
  inventory_item_unit?: string | null
  quantity_used: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AddonPayload {
  name: string
  price: number
  inventory_item_id: number | null
  quantity_used: number | null
  is_active: boolean
}
