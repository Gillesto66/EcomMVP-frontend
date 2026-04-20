// Auteur : Gilles - Projet : AGC Space - Module : Auth - Service
import apiClient from '@/src/lib/api'
import type { User, AuthTokens, UserRole } from '@/src/types'

export const authService = {
  async login(username: string, password: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>('/auth/login/', { username, password })
    if (typeof window !== 'undefined') {
      localStorage.setItem('agc_access', data.access)
      localStorage.setItem('agc_refresh', data.refresh)
    }
    return data
  },

  async register(payload: {
    username: string
    email: string
    password: string
    role?: UserRole
  }): Promise<User> {
    const { data } = await apiClient.post<User>('/auth/register/', payload)
    return data
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me/')
    return data
  },

  async updateMe(payload: Partial<User>): Promise<User> {
    const { data } = await apiClient.patch<User>('/auth/me/', payload)
    return data
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/me/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    })
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agc_access')
      localStorage.removeItem('agc_refresh')
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('agc_access')
  },
}
