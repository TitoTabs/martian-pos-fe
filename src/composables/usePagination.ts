import { computed, ref, watch, type Ref } from 'vue'

/**
 * Client-side pagination over an already-filtered list. Keeps all existing
 * filters working (they live upstream and produce `source`); call `reset()`
 * when a filter changes to jump back to page 1. The current page is clamped
 * into range when the list shrinks, and changing page size returns to page 1.
 */
export function usePagination<T>(source: Ref<readonly T[]>, defaultPerPage = 10) {
  const page = ref(1)
  const perPage = ref(defaultPerPage)

  const total = computed(() => source.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))

  const paginated = computed(() => {
    const start = (page.value - 1) * perPage.value
    return source.value.slice(start, start + perPage.value)
  })

  /** 1-based index of the first/last item shown, for "X–Y of N" labels. */
  const from = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1))
  const to = computed(() => Math.min(page.value * perPage.value, total.value))

  function reset() {
    page.value = 1
  }

  // Returning to page 1 whenever the page size changes.
  watch(perPage, reset)
  // Keep the current page valid if the list shrinks beneath it.
  watch(totalPages, (pages) => {
    if (page.value > pages) page.value = pages
  })

  return { page, perPage, total, totalPages, paginated, from, to, reset }
}
