export interface Expense {
  id: number
  name: string
  amount: number
  quantity: number
  total_amount: number
  date: string
  created_at: string
}

export interface ExpensePayload {
  name: string
  amount: number
  quantity: number
  date: string
}

export type ExpensePeriod = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'

export interface ExpenseDateFilter {
  period: ExpensePeriod
  from: string
  to: string
}
