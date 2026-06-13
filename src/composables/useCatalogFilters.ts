import { computed, ref, type Ref } from 'vue'

export type SortOrder = 'az' | 'za'

/**
 * Alphabetical sorting + category filtering for admin catalog lists
 * (products, inventory items). Pass `fixedCategories` to filter against a
 * predefined list instead of deriving categories from the loaded items.
 */
export function useCatalogFilters<T extends { name: string; category: string }>(
  items: Ref<T[]>,
  fixedCategories?: readonly string[],
) {
  const sort = ref<SortOrder>('az')
  const category = ref('all')
  const search = ref('')

  const categories = computed(() =>
    fixedCategories
      ? [...fixedCategories]
      : [...new Set(items.value.map((item) => item.category))].sort(),
  )

  const filtered = computed(() => {
    const term = search.value.trim().toLowerCase()
    const list = items.value.filter(
      (item) =>
        (category.value === 'all' || item.category === category.value) &&
        (term === '' || item.name.toLowerCase().includes(term)),
    )

    return list.sort((a, b) =>
      sort.value === 'az' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    )
  })

  return { sort, category, search, categories, filtered }
}
