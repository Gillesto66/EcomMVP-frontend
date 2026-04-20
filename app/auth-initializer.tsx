// Auteur : Gilles - Projet : AGC Space - Module : Auth - Composant Initialisation
'use client'

import { useAuthInitialize } from '@/src/modules/auth/hooks/useAuthInitialize'

/**
 * Composant wrapper pour initialiser la session utilisateur.
 * Doit être utilisé au niveau du layout root, avant les pages/routes.
 * 
 * Usage:
 *   <AuthInitializer>
 *     {children}
 *   </AuthInitializer>
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuthInitialize()
  return <>{children}</>
}
