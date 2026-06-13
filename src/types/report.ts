import type { Expense } from '@/types/expense'
import type { InventoryItem } from '@/types/inventoryItem'
import type { ManualSalesAdjustment } from '@/types/manualSalesAdjustment'
import type { Sale } from '@/types/sale'

export type Period = 'today' | 'week' | 'month' | 'year'

/** A report range: either a preset period, or an explicit custom range (YYYY-MM-DD). */
export interface RangeQuery {
  period?: Period
  startDate?: string
  endDate?: string
}

export interface SalesSummary {
  pos_sales_total: number
  manual_sales_total: number
  /** Combined: POS sales + manual sales adjustments. */
  total_sales: number
  total_orders: number
  total_items_sold: number
}

export interface TopProduct {
  name: string
  quantity_sold: number
  revenue: number
}

export interface DashboardData extends SalesSummary {
  period: Period
  total_expenses: number
  top_products: TopProduct[]
  low_stock: InventoryItem[]
  recent_sales: Sale[]
  recent_expenses: Expense[]
}

export interface SalesReport extends SalesSummary {
  sales: Sale[]
  manual_adjustments: ManualSalesAdjustment[]
}

export interface ExpensesReport {
  total_expenses: number
  expenses: Expense[]
}

export interface InventoryReportItem {
  id: number
  name: string
  category: string
  unit: string
  stock: number
  min_stock: number
  cost_per_unit: number
  used: number
  is_active: boolean
}

export interface InventoryReport {
  items: InventoryReportItem[]
}

export interface SavingsReport {
  pos_sales_total: number
  manual_sales_total: number
  /** Combined: POS sales + manual sales adjustments. */
  total_sales: number
  total_expenses: number
}
