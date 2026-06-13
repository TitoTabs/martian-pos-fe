import api from '@/services/api'
import type {
  ExpensesReport,
  InventoryReport,
  Period,
  SalesReport,
  SavingsReport,
} from '@/types/report'

/** Either a preset period, or an explicit custom date range (YYYY-MM-DD). */
export interface SavingsQuery {
  period?: Period
  startDate?: string
  endDate?: string
}

export const reportService = {
  async sales(period: Period): Promise<SalesReport> {
    const { data } = await api.get<{ data: SalesReport }>('/reports/sales', {
      params: { period },
    })
    return data.data
  },

  async expenses(period: Period): Promise<ExpensesReport> {
    const { data } = await api.get<{ data: ExpensesReport }>('/reports/expenses', {
      params: { period },
    })
    return data.data
  },

  async inventory(period: Period): Promise<InventoryReport> {
    const { data } = await api.get<{ data: InventoryReport }>('/reports/inventory', {
      params: { period },
    })
    return data.data
  },

  async savings(query: SavingsQuery): Promise<SavingsReport> {
    const params =
      query.startDate && query.endDate
        ? { start_date: query.startDate, end_date: query.endDate }
        : { period: query.period ?? 'today' }
    const { data } = await api.get<{ data: SavingsReport }>('/reports/savings', { params })
    return data.data
  },
}
