// Auteur : Gilles - Projet : AGC Space - Module : Layout racine
import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import { AuthInitializer } from './auth-initializer'
import ClientShell from './client-shell'
import SkipLink from '@/src/components/ui/SkipLink'

export const metadata: Metadata = {
  title: 'AGC Space',
  description: "L'écosystème e-commerce intelligent.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased bg-white text-gray-900">
        <SkipLink />
        <Providers>
          <AuthInitializer>
            {children}
            <ClientShell />
          </AuthInitializer>
        </Providers>
      </body>
    </html>
  )
}
