import api from '@/services/api'
import type { DashboardData, RangeQuery } from '@/types/report'
import { rangeParams } from '@/utils/rangeParams'

export const dashboardService = {
  async get(query: RangeQuery): Promise<DashboardData> {
    const { data } = await api.get<{ data: DashboardData }>('/dashboard', {
      params: rangeParams(query),
    })
    return data.data
  },
}
