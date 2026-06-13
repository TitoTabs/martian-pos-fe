import axios, { AxiosError } from 'axios'

import type { ApiError } from '@/types/api'

const AUTH_TOKEN_KEY = 'auth_token'

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Attach the auth token when one is available.
api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize errors into a single ApiError shape so callers
// never have to dig into the raw Axios error.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      message: error.response?.data?.message ?? 'Something went wrong. Please try again.',
      errors: error.response?.data?.errors ?? {},
    }

    if (!error.response) {
      apiError.message = 'Unable to reach the server. Check your connection.'
    } else if (error.response.status === 401) {
      setAuthToken(null)
      apiError.message = 'Your session has expired. Please log in again.'
    }

    return Promise.reject(apiError)
  },
)

export default api
