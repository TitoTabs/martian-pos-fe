import { ref, watch } from 'vue'

import { reportService } from '@/services/reportService'
import type { ApiError } from '@/types/api'
import type {
  ExpensesReport,
  InventoryReport,
  Period,
  SalesReport,
  SavingsReport,
} from '@/types/report'

export type ReportTab = 'sales' | 'expenses' | 'inventory' | 'savings'

export function useReports() {
  const period = ref<Period>('today')
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
          salesReport.value = await reportService.sales(period.value)
          break
        case 'expenses':
          expensesReport.value = await reportService.expenses(period.value)
          break
        case 'inventory':
          inventoryReport.value = await reportService.inventory(period.value)
          break
        case 'savings':
          savingsReport.value = await reportService.savings({ period: period.value })
          break
      }
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      loading.value = false
    }
  }

  watch([period, tab], fetchReport)

  return {
    period,
    tab,
    loading,
    error,
    salesReport,
    expensesReport,
    inventoryReport,
    savingsReport,
    fetchReport,
  }
}
