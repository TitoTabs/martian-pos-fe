import { ref, watch } from 'vue'

import { reportService } from '@/services/reportService'
import type { ApiError } from '@/types/api'
import type {
  ExpensesReport,
  InventoryReport,
  RangeQuery,
  SalesReport,
  SavingsReport,
} from '@/types/report'

export type ReportTab = 'sales' | 'expenses' | 'inventory' | 'savings'

export function useReports() {
  const query = ref<RangeQuery>({ period: 'today' })
  const tab = ref<ReportTab>('sales')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const salesReport = ref<SalesReport | null>(null)
  const expensesReport = ref<ExpensesReport | null>(null)
  const inventoryReport = ref<InventoryReport | null>(null)
  const savingsReport = ref<SavingsReport | null>(null)

  async function fetchReport() {
    loading.value = true
    error.value = null
    try {
      switch (tab.value) {
        case 'sales':
          salesReport.value = await reportService.sales(query.value)
          break
        case 'expenses':
          expensesReport.value = await reportService.expenses(query.value)
          break
        case 'inventory':
          inventoryReport.value = await reportService.inventory(query.value)
          break
        case 'savings':
          savingsReport.value = await reportService.savings(query.value)
          break
      }
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      loading.value = false
    }
  }

  /** Apply a new range (preset or custom) and refetch the active tab. */
  function setRange(next: RangeQuery) {
    query.value = next
    fetchReport()
  }

  watch(tab, fetchReport)

  return {
    query,
    tab,
    loading,
    error,
    salesReport,
    expensesReport,
    inventoryReport,
    savingsReport,
    fetchReport,
    setRange,
  }
}
