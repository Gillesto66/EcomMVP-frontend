'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Auth - LoginForm
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../store/authStore'
import { cn } from '@/src/lib/utils'

/** Calcule la route de destination après connexion selon les rôles de l'utilisateur. */
function getPostLoginRoute(roles: { name: string }[]): string {
  const names = roles.map((r) => r.name)
  // Priorité : ecommercant > affilie > client
  if (names.includes('ecommercant')) return '/dashboard'
  if (names.includes('affilie')) return '/dashboard/affiliations'
  // Client pur → shop
  return '/shop'
}

export default function LoginForm() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ username: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login(form.username, form.password)
      // Lire l'utilisateur depuis le store après login
      const user = useAuthStore.getState().user
      const destination = user ? getPostLoginRoute(user.roles) : '/shop'
      router.push(destination)
    } catch {
      // Erreur gérée dans le store
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-theme text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom d&apos;utilisateur</label>
        <input
          type="text"
          required
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-theme',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'text-sm'
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-theme',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'text-sm'
          )}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          'w-full py-2 px-4 rounded-theme font-medium text-white',
          'bg-primary hover:opacity-90 transition-opacity',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>

      <p className="text-sm text-center text-gray-600">
        Pas encore de compte ?{' '}
        <a href="/register" className="text-primary hover:underline font-medium">
          S&apos;inscrire
        </a>
      </p>
    </form>
  )
}
