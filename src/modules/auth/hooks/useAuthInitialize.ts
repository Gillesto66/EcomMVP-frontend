// Auteur : Gilles - Projet : AGC Space - Module : Auth - Hook Initialisation Session
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { authService } from '../service/authService'

/**
 * Hook pour initialiser la session utilisateur au chargement de l'app.
 * Restaure l'utilisateur depuis le backend si un token valide existe en localStorage.
 * 
 * Usage dans le layout root:
 *   export default function RootLayout({ children }) {
 *     useAuthInitialize()
 *     return <html>...</html>
 *   }
 */
export function useAuthInitialize() {
  const { user, fetchMe } = useAuthStore()

  useEffect(() => {
    // Si l'utilisateur est déjà chargé, ne rien faire
    if (user) return

    // Vérifier si des tokens existent dans localStorage
    if (!authService.isAuthenticated()) return

    // Restaurer l'utilisateur depuis le backend
    const initializeUser = async () => {
      try {
        await fetchMe()
      } catch (err) {
        console.error('[Auth] Erreur lors de la restauration de la session:', err)
        // Si la restauration échoue (tokens expirés), se déconnecter
        authService.logout()
        useAuthStore.setState({ user: null })
      }
    }

    initializeUser()
  }, [user, fetchMe])
}
