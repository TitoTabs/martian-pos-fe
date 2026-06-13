import { computed, ref } from 'vue'

import { dashboardService } from '@/services/dashboardService'
import type { ApiError } from '@/types/api'
import type { DashboardData, RangeQuery } from '@/types/report'
import { netRevenue } from '@/utils/calculations'

export function useDashboard() {
  const query = ref<RangeQuery>({ period: 'today' })
  const data = ref<DashboardData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDashboard() {
    loading.value = true
    error.value = null
    try {
      data.value = await dashboardService.get(query.value)
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      loading.value = false
    }
  }

  /** Apply a new range (preset or custom) and refetch. */
  function setRange(next: RangeQuery) {
    query.value = next
    fetchDashboard()
  }

  /** Net profit = net revenue = sales − expenses for the selected range. */
  const profit = computed(() =>
    data.value ? netRevenue(data.value.total_sales, data.value.total_expenses) : 0,
  )

  return { query, data, loading, error, profit, fetchDashboard, setRange }
}
