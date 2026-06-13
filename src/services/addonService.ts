import api from '@/services/api'
import type { Addon, AddonPayload } from '@/types/addon'

export const addonService = {
  async list(activeOnly = false): Promise<Addon[]> {
    const { data } = await api.get<{ data: Addon[] }>('/addons', {
      params: activeOnly ? { active: 1 } : {},
    })
    return data.data
  },

  async create(payload: AddonPayload): Promise<Addon> {
    const { data } = await api.post<{ data: Addon }>('/addons', payload)
    return data.data
  },

  async update(id: number, payload: Partial<AddonPayload>): Promise<Addon> {
    const { data } = await api.put<{ data: Addon }>(`/addons/${id}`, payload)
    return data.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/addons/${id}`)
  },
}
