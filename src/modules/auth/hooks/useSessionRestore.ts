// Auteur : Gilles - Projet : AGC Space - Module : Auth - Hook Restauration Session
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '@/src/modules/cart/store/cartStore'

/**
 * Hook pour restaurer l'état utilisateur et panier après une connexion/reconnexion.
 * Utile pour détecter les changements de session (login/logout).
 */
export function useSessionRestore() {
  const { user } = useAuthStore()
  const [previousUser, setPreviousUser] = useState<typeof user>(null)

  useEffect(() => {
    // Détecter le login
    if (!previousUser && user) {
      console.info('[Auth] Utilisateur connecté:', user.username)
      // Optionnel: réinitialiser le panier à la connexion
      // useCartStore.setState({ items: [] })
      
      // Restaurer les préférences utilisateur si nécessaire
      // (géré via le backend ou localStorage)
    }

    // Détecter le logout
    if (previousUser && !user) {
      console.info('[Auth] Utilisateur déconnecté')
      // Vider le panier à la déconnexion
      useCartStore.getState().clearCart()
    }

    setPreviousUser(user)
  }, [user, previousUser])
}
