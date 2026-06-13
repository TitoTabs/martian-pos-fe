import api from '@/services/api'
import type {
  ExpensesReport,
  InventoryReport,
  RangeQuery,
  SalesReport,
  SavingsReport,
} from '@/types/report'
import { rangeParams } from '@/utils/rangeParams'

export const reportService = {
  async sales(query: RangeQuery): Promise<SalesReport> {
    const { data } = await api.get<{ data: SalesReport }>('/reports/sales', {
      params: rangeParams(query),
    })
    return data.data
  },

  async expenses(query: RangeQuery): Promise<ExpensesReport> {
    const { data } = await api.get<{ data: ExpensesReport }>('/reports/expenses', {
      params: rangeParams(query),
    })
    return data.data
  },

  async inventory(query: RangeQuery): Promise<InventoryReport> {
    const { data } = await api.get<{ data: InventoryReport }>('/reports/inventory', {
      params: rangeParams(query),
    })
    return data.data
  },

  async savings(query: RangeQuery): Promise<SavingsReport> {
    const { data } = await api.get<{ data: SavingsReport }>('/reports/savings', {
      params: rangeParams(query),
    })
    return data.data
  },
}
