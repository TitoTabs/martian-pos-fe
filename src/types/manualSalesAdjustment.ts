export interface ManualSalesAdjustment {
  id: number
  date: string
  amount: number
  notes: string | null
  created_at: string
}

export interface ManualSalesAdjustmentPayload {
  date: string
  amount: number
  notes: string
}
