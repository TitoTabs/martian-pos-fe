import api from '@/services/api'
import type { Paginated } from '@/types/api'
import type { Sale, SalePayload } from '@/types/sale'

export const saleService = {
  async list(page = 1): Promise<Paginated<Sale>> {
    const { data } = await api.get<Paginated<Sale>>('/sales', { params: { page } })
    return data
  },

  async create(payload: SalePayload): Promise<Sale> {
    const { data } = await api.post<{ data: Sale }>('/sales', payload)
    return data.data
  },
}
