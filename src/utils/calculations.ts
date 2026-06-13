/**
 * Allocation percentages applied to eligible sales (pastries already
 * excluded upstream). The four shares total 100%.
 */
export const SAVINGS_ALLOCATION = {
  creditCard: 0.2,
  capitalRecovery: 0.3,
  personalAllowance: 0.25,
  savings: 0.25,
} as const

export interface AllocationBreakdown {
  eligibleSales: number
  creditCard: number
  capitalRecovery: number
  personalAllowance: number
  savings: number
}

/**
 * Split eligible sales into the four allocation buckets.
 *
 *   Credit Card Payment = 20% of eligible sales
 *   Capital Recovery    = 30% of eligible sales
 *   Personal Allowance  = 25% of eligible sales
 *   Savings             = 25% of eligible sales
 */
export function allocationBreakdown(eligibleSales: number): AllocationBreakdown {
  return {
    eligibleSales,
    creditCard: round(eligibleSales * SAVINGS_ALLOCATION.creditCard),
    capitalRecovery: round(eligibleSales * SAVINGS_ALLOCATION.capitalRecovery),
    personalAllowance: round(eligibleSales * SAVINGS_ALLOCATION.personalAllowance),
    savings: round(eligibleSales * SAVINGS_ALLOCATION.savings),
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
