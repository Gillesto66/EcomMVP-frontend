'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Auth - RegisterForm
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../store/authStore'
import { cn } from '@/src/lib/utils'
import type { UserRole } from '@/src/types'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'client', label: 'Client — J\'achète des produits' },
  { value: 'ecommercant', label: 'E-commerçant — Je vends des produits' },
  { value: 'affilie', label: 'Affilié — Je génère des ventes' },
]

export default function RegisterForm() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'client' as UserRole,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await register(form)
      router.push('/login?registered=1')
    } catch {
      // Erreur gérée dans le store
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-theme text-sm">
          {error}
        </div>
      )}

      {(['username', 'email', 'password'] as const).map((field) => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
            {field === 'username' ? "Nom d'utilisateur" : field === 'email' ? 'Email' : 'Mot de passe'}
          </label>
          <input
            type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
            required
            value={form[field]}
            onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-theme focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Je suis…</label>
        <div className="space-y-2">
          {ROLES.map((r) => (
            <label key={r.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={form.role === r.value}
                onChange={() => setForm((f) => ({ ...f, role: r.value }))}
                className="text-primary"
              />
              <span className="text-sm text-gray-700">{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 rounded-theme font-medium text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isLoading ? 'Création...' : 'Créer mon compte'}
      </button>
    </form>
  )
}
