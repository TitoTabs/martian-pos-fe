export const INVENTORY_UNITS = ['pcs', 'grams', 'kg', 'ml', 'liters', 'pack', 'box'] as const

export type InventoryUnit = (typeof INVENTORY_UNITS)[number]

export interface InventoryItem {
  id: number
  name: string
  category: string
  unit: InventoryUnit
  stock: number
  min_stock: number
  cost_per_unit: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryItemPayload {
  name: string
  category: string
  unit: InventoryUnit
  stock: number
  min_stock: number
  cost_per_unit: number
  is_active: boolean
}
