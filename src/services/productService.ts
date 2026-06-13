import api from '@/services/api'
import type { Product, ProductPayload } from '@/types/product'

export const productService = {
  /** Fetch every product (admin inventory list). */
  async listAll(): Promise<Product[]> {
    const { data } = await api.get<{ data: Product[] }>('/products', {
      params: { all: 1 },
    })
    return data.data
  },

  /** Fetch active products only (POS item grid). */
  async listActive(): Promise<Product[]> {
    const { data } = await api.get<{ data: Product[] }>('/products', {
      params: { all: 1, active: 1 },
    })
    return data.data
  },

  async create(payload: ProductPayload): Promise<Product> {
    const { data } = await api.post<{ data: Product }>('/products', payload)
    return data.data
  },

  async update(id: number, payload: Partial<ProductPayload>): Promise<Product> {
    const { data } = await api.put<{ data: Product }>(`/products/${id}`, payload)
    return data.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/products/${id}`)
  },
}
