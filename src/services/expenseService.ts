import api from '@/services/api'
import type { Paginated } from '@/types/api'
import type { Expense, ExpenseDateFilter, ExpensePayload } from '@/types/expense'

export interface ExpenseListResponse extends Paginated<Expense> {
  total_expenses: number
}

export const expenseService = {
  async list(page = 1, filter?: ExpenseDateFilter): Promise<ExpenseListResponse> {
    const params: Record<string, string | number> = { page }

    if (filter && filter.period !== 'all') {
      if (filter.period === 'custom') {
        if (filter.from && filter.to) {
          params.from = filter.from
          params.to = filter.to
        }
      } else {
        params.period = filter.period
      }
    }

    const { data } = await api.get<ExpenseListResponse>('/expenses', { params })
    return data
  },

  async create(payload: ExpensePayload): Promise<Expense> {
    const { data } = await api.post<{ data: Expense }>('/expenses', payload)
    return data.data
  },

  async update(id: number, payload: ExpensePayload): Promise<Expense> {
    const { data } = await api.put<{ data: Expense }>(`/expenses/${id}`, payload)
    return data.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/expenses/${id}`)
  },
}
