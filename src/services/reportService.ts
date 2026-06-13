import api from '@/services/api'
import type {
  ExpensesReport,
  InventoryReport,
  Period,
  SalesReport,
  SavingsReport,
} from '@/types/report'

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

  async savings(period: Period): Promise<SavingsReport> {
    const { data } = await api.get<{ data: SavingsReport }>('/reports/savings', {
      params: { period },
    })
    return data.data
  },
}
