import type { ProductCategory } from '@/constants/productCategories'
import type { Addon } from '@/types/addon'

export interface ProductIngredient {
  inventory_item_id: number
  name: string
  unit: string
  quantity: number
}

/** A sellable menu item. Stock lives on inventory items via the recipe. */
export interface Product {
  id: number
  name: string
  category: ProductCategory
  description: string | null
  image: string | null
  price: number
  is_active: boolean
  addons: Addon[]
  ingredients: ProductIngredient[]
  created_at: string
  updated_at: string
}

export interface ProductPayload {
  name: string
  category: ProductCategory
  price: number
  addon_ids: number[]
  description?: string | null
  image?: string | null
  is_active?: boolean
  ingredients?: { inventory_item_id: number; quantity: number }[]
}
