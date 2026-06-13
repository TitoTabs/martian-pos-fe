/** Allocation percentages applied to net revenue (sales − expenses). */
export const SAVINGS_ALLOCATION = {
  ccPayment: 0.2,
  capitalRecovery: 0.3,
  savings: 0.5,
} as const

export interface SavingsBreakdown {
  totalSales: number
  totalExpenses: number
  netRevenue: number
  ccPayment: number
  capitalRecovery: number
  savings: number
}

/**
 * Business rule: allocation is based on net revenue, never gross sales.
 *
 *   Net Revenue = Total Sales − Total Expenses
 *   CC Payment = 20% of Net Revenue
 *   Capital Recovery = 30% of Net Revenue
 *   Savings / Net Profit = 50% of Net Revenue
 */
export function savingsBreakdown(totalSales: number, totalExpenses: number): SavingsBreakdown {
  const revenue = netRevenue(totalSales, totalExpenses)

  return {
    totalSales,
    totalExpenses,
    netRevenue: revenue,
    ccPayment: round(revenue * SAVINGS_ALLOCATION.ccPayment),
    capitalRecovery: round(revenue * SAVINGS_ALLOCATION.capitalRecovery),
    savings: round(revenue * SAVINGS_ALLOCATION.savings),
  }
}

export function netRevenue(totalSales: number, totalExpenses: number): number {
  return round(totalSales - totalExpenses)
}

export function expenseTotal(amount: number, quantity: number): number {
  return round(amount * quantity)
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
