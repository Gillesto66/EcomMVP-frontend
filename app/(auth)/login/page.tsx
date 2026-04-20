// Auteur : Gilles - Projet : AGC Space - Module : Page Login (SSR)
import type { Metadata } from 'next'
import LoginForm from '@/src/modules/auth/components/LoginForm'

export const metadata: Metadata = { title: 'Connexion — AGC Space' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <LoginForm />
    </div>
  )
}
