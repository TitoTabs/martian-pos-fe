import { reactive, ref, watch } from 'vue'

import { expenseService } from '@/services/expenseService'
import type { ApiError, Paginated } from '@/types/api'
import type { Expense, ExpenseDateFilter, ExpensePayload } from '@/types/expense'

export function useExpenses() {
  const expenses = ref<Expense[]>([])
  const meta = ref<Paginated<Expense>['meta'] | null>(null)
  const totalExpenses = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const filter = reactive<ExpenseDateFilter>({ period: 'all', from: '', to: '' })

  async function fetchExpenses(page = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await expenseService.list(page, filter)
      expenses.value = response.data
      meta.value = response.meta
      totalExpenses.value = response.total_expenses
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      loading.value = false
    }
  }

  // Refetch when the filter changes; a custom range only applies
  // once both dates are picked.
  watch(
    () => [filter.period, filter.from, filter.to],
    () => {
      if (filter.period === 'custom' && (!filter.from || !filter.to)) return
      fetchExpenses(1)
    },
  )

  async function saveExpense(payload: ExpensePayload, id?: number): Promise<boolean> {
    saving.value = true
    error.value = null
    try {
      if (id) {
        await expenseService.update(id, payload)
      } else {
        await expenseService.create(payload)
      }
      await fetchExpenses(meta.value?.current_page ?? 1)
      return true
    } catch (e) {
      error.value = (e as ApiError).message
      return false
    } finally {
      saving.value = false
    }
  }

  async function deleteExpense(expense: Expense): Promise<boolean> {
    saving.value = true
    error.value = null
    try {
      await expenseService.remove(expense.id)
      await fetchExpenses(meta.value?.current_page ?? 1)
      return true
    } catch (e) {
      error.value = (e as ApiError).message
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    expenses,
    meta,
    totalExpenses,
    filter,
    loading,
    saving,
    error,
    fetchExpenses,
    saveExpense,
    deleteExpense,
  }
}
