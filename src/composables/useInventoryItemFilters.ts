import { computed, ref, type Ref } from 'vue'

import { useCatalogFilters } from '@/composables/useCatalogFilters'
import type { InventoryItem } from '@/types/inventoryItem'

export type StockStatus = 'all' | 'in' | 'low' | 'out'

/**
 * Catalog filters plus stock-level filtering for inventory items:
 * out = no stock left, low = at/below minimum, in = above minimum.
 */
export function useInventoryItemFilters(items: Ref<InventoryItem[]>) {
  const { sort, category, search, categories, filtered: byCatalog } = useCatalogFilters(items)

  const stockStatus = ref<StockStatus>('all')

  function matchesStock(item: InventoryItem): boolean {
    switch (stockStatus.value) {
      case 'out':
        return item.stock <= 0
      case 'low':
        return item.stock > 0 && item.stock <= item.min_stock
      case 'in':
        return item.stock > item.min_stock
      default:
        return true
    }
  }

  const filtered = computed(() => byCatalog.value.filter(matchesStock))

  return { sort, category, search, categories, stockStatus, filtered }
}
