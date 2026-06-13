import { computed, ref, watch } from 'vue'

import { dashboardService } from '@/services/dashboardService'
import type { ApiError } from '@/types/api'
import type { DashboardData, Period } from '@/types/report'
import { netRevenue } from '@/utils/calculations'

export function useDashboard() {
  const period = ref<Period>('today')
  const data = ref<DashboardData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDashboard() {
    loading.value = true
    error.value = null
    try {
      data.value = await dashboardService.get(period.value)
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      loading.value = false
    }
  }

  /** Net profit = net revenue = sales − expenses for the selected period. */
  const profit = computed(() =>
    data.value ? netRevenue(data.value.total_sales, data.value.total_expenses) : 0,
  )

  watch(period, fetchDashboard)

  return { period, data, loading, error, profit, fetchDashboard }
}
