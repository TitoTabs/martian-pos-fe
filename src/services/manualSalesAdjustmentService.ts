import api from '@/services/api'
import type { Paginated } from '@/types/api'
import type { ExpenseDateFilter } from '@/types/expense'
import type {
  ManualSalesAdjustment,
  ManualSalesAdjustmentPayload,
} from '@/types/manualSalesAdjustment'

export interface ManualSalesAdjustmentListResponse extends Paginated<ManualSalesAdjustment> {
  total_manual_sales: number
}

export const manualSalesAdjustmentService = {
  async list(page = 1, filter?: ExpenseDateFilter): Promise<ManualSalesAdjustmentListResponse> {
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

    const { data } = await api.get<ManualSalesAdjustmentListResponse>(
      '/manual-sales-adjustments',
      { params },
    )
    return data
  },

  async create(payload: ManualSalesAdjustmentPayload): Promise<ManualSalesAdjustment> {
    const { data } = await api.post<{ data: ManualSalesAdjustment }>(
      '/manual-sales-adjustments',
      payload,
    )
    return data.data
  },

  async update(id: number, payload: ManualSalesAdjustmentPayload): Promise<ManualSalesAdjustment> {
    const { data } = await api.put<{ data: ManualSalesAdjustment }>(
      `/manual-sales-adjustments/${id}`,
      payload,
    )
    return data.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/manual-sales-adjustments/${id}`)
  },
}
