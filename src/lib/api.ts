// Auteur : Gilles - Projet : AGC Space - Module : API Client
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    // Bypass la page d'interstitiel Ngrok en production
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
})

// ── Intercepteur requête — injecte le JWT ─────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('agc_access')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Intercepteur réponse — refresh automatique du token ──────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('agc_refresh')
        if (!refresh) throw new Error('No refresh token')
        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/token/refresh/`, { refresh })
        localStorage.setItem('agc_access', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return apiClient(original)
      } catch {
        // Refresh échoué → déconnexion
        localStorage.removeItem('agc_access')
        localStorage.removeItem('agc_refresh')
        if (typeof window !== 'undefined') window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
