// Auteur : Gilles - Projet : AGC Space - Module : Page Register (SSR)
import type { Metadata } from 'next'
import RegisterForm from '@/src/modules/auth/components/RegisterForm'

export const metadata: Metadata = { title: 'Inscription — AGC Space' }

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <RegisterForm />
    </div>
  )
}
