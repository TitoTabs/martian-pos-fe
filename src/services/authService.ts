import api from '@/services/api'
import type { LoginPayload, User } from '@/types/auth'

export const authService = {
  async login(payload: LoginPayload): Promise<{ token: string; user: User }> {
    const { data } = await api.post<{ data: { token: string; user: User } }>(
      '/auth/login',
      payload,
    )
    return data.data
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ data: User }>('/auth/me')
    return data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}
