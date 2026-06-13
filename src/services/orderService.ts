import api from '@/services/api'
import type { OrderStatus, Sale } from '@/types/sale'

export const orderService = {
  /** Active barista queue (pending/preparing/ready) or completed history. */
  async list(view: 'active' | 'completed' = 'active'): Promise<Sale[]> {
    const { data } = await api.get<{ data: Sale[] }>('/orders', { params: { view } })
    return data.data
  },

  async updateStatus(id: number, status: OrderStatus): Promise<Sale> {
    const { data } = await api.patch<{ data: Sale }>(`/orders/${id}/status`, { status })
    return data.data
  },
}
