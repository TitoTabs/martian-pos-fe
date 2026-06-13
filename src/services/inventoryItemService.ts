import api from '@/services/api'
import type { InventoryItem, InventoryItemPayload } from '@/types/inventoryItem'

export const inventoryItemService = {
  async list(): Promise<InventoryItem[]> {
    const { data } = await api.get<{ data: InventoryItem[] }>('/inventory-items')
    return data.data
  },

  async create(payload: InventoryItemPayload): Promise<InventoryItem> {
    const { data } = await api.post<{ data: InventoryItem }>('/inventory-items', payload)
    return data.data
  },

  async update(id: number, payload: Partial<InventoryItemPayload>): Promise<InventoryItem> {
    const { data } = await api.put<{ data: InventoryItem }>(`/inventory-items/${id}`, payload)
    return data.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/inventory-items/${id}`)
  },
}
