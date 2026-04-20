// Auteur : Gilles - Projet : AGC Space - Module : Auth - Store Zustand
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, UserRole } from '@/src/types'
import { authService } from '../service/authService'

// SSR-safe storage : évalué à l'exécution (pas au module-level)
const ssrSafeStorage = createJSONStorage(() =>
  typeof window !== 'undefined' ? localStorage : ({
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  } as Storage)
)

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  // Actions
  login: (username: string, password: string) => Promise<void>
  register: (payload: { username: string; email: string; password: string; role?: UserRole }) => Promise<void>
  fetchMe: () => Promise<void>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null })
        try {
          await authService.login(username, password)
          const user = await authService.getMe()
          set({ user, isLoading: false })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Erreur de connexion'
          set({ error: msg, isLoading: false })
          throw err
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          await authService.register(payload)
          set({ isLoading: false })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Erreur d'inscription"
          set({ error: msg, isLoading: false })
          throw err
        }
      },

      fetchMe: async () => {
        set({ isLoading: true })
        try {
          const user = await authService.getMe()
          set({ user, isLoading: false })
        } catch {
          set({ user: null, isLoading: false })
        }
      },

      logout: () => {
        authService.logout()
        set({ user: null, error: null })
      },

      hasRole: (role) => {
        const { user } = get()
        return user?.roles.some((r) => r.name === role) ?? false
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'agc-auth',
      storage: ssrSafeStorage,
      partialize: (state) => ({ user: state.user }),
    }
  )
)
