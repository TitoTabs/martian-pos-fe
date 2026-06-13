/**
 * Allowed product categories. Must stay in sync with the backend
 * App\Enums\ProductCategory enum — the API rejects anything else.
 */
export const PRODUCT_CATEGORIES = [
  'Iced Coffee',
  'Non Coffee',
  'Matcha Series',
  'Refreshers',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
