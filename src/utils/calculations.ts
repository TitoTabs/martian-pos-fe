/**
 * Allocation percentages applied to net revenue (Total Sales − Expenses,
 * with pastries already excluded from sales upstream). The four shares
 * total 100%.
 */
export const SAVINGS_ALLOCATION = {
  creditCard: 0.2,
  capitalRecovery: 0.3,
  personalAllowance: 0.25,
  savings: 0.25,
} as const

export interface AllocationBreakdown {
  netRevenue: number
  creditCard: number
  capitalRecovery: number
  personalAllowance: number
  savings: number
}

/**
 * Split net revenue into the four allocation buckets. Allocation is always
 * based on Net Revenue (Total Sales − Expenses), never gross/eligible sales.
 *
 *   Credit Card Payment = 20% of net revenue
 *   Capital Recovery    = 30% of net revenue
 *   Personal Allowance  = 25% of net revenue
 *   Savings             = 25% of net revenue
 */
export function allocationBreakdown(netRevenueAmount: number): AllocationBreakdown {
  return {
    netRevenue: netRevenueAmount,
    creditCard: round(netRevenueAmount * SAVINGS_ALLOCATION.creditCard),
    capitalRecovery: round(netRevenueAmount * SAVINGS_ALLOCATION.capitalRecovery),
    personalAllowance: round(netRevenueAmount * SAVINGS_ALLOCATION.personalAllowance),
    savings: round(netRevenueAmount * SAVINGS_ALLOCATION.savings),
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
