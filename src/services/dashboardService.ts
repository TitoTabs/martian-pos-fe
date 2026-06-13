import api from '@/services/api'
import type { DashboardData, Period } from '@/types/report'

export const dashboardService = {
  async get(period: Period): Promise<DashboardData> {
    const { data } = await api.get<{ data: DashboardData }>('/dashboard', {
      params: { period },
    })
    return data.data
  },
}
