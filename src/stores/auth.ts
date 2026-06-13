import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getAuthToken, setAuthToken } from '@/services/api'
import { authService } from '@/services/authService'
import type { LoginPayload, User } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(getAuthToken())

  const isAuthenticated = computed(() => token.value !== null)

  async function login(payload: LoginPayload) {
    const response = await authService.login(payload)
    setAuthToken(response.token)
    token.value = response.token
    user.value = response.user
  }

  async function logout() {
    try {
      await authService.logout()
    } catch {
      // Token may already be invalid; clear local state regardless.
    }
    setAuthToken(null)
    token.value = null
    user.value = null
  }

  /** Restore the user for an existing token (e.g. after a page reload). */
  async function fetchUser() {
    if (!token.value || user.value) return
    try {
      user.value = await authService.me()
    } catch {
      setAuthToken(null)
      token.value = null
      user.value = null
    }
  }

  return { user, token, isAuthenticated, login, logout, fetchUser }
})
