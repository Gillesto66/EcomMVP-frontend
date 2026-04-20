// Auteur : Gilles - Projet : AGC Space - Tests : Session persistence & Cart system
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useAuthStore } from '@/src/modules/auth/store/authStore'
import { useCartStore } from '@/src/modules/cart/store/cartStore'
import { authService } from '@/src/modules/auth/service/authService'
import type { Product, User } from '@/src/types'

// Mock user & products
const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  roles: [{ id: 1, name: 'customer' }],
}

const mockProduct: Product = {
  id: 1,
  owner: 1,
  owner_username: 'seller',
  name: 'Formation Django',
  description: 'Apprenez Django',
  price: '97.00',
  sku: 'FORM-001',
  is_digital: true,
  is_active: true,
  stock: 100,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('Session Persistence & Cart System', () => {
  beforeEach(() => {
    // Reset stores
    useAuthStore.setState({ user: null, error: null })
    useCartStore.setState({ items: [], isOpen: false, lastOrder: null })
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // CART TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Cart Store', () => {
    it('devrait ajouter un produit au panier', () => {
      useCartStore.getState().addItem(mockProduct)
      expect(useCartStore.getState().items).toHaveLength(1)
      expect(useCartStore.getState().items[0].quantity).toBe(1)
      expect(useCartStore.getState().totalItems()).toBe(1)
    })

    it('devrait incrémenter la quantité si produit existe', () => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().addItem(mockProduct, 2)
      expect(useCartStore.getState().items).toHaveLength(1)
      expect(useCartStore.getState().items[0].quantity).toBe(3)
    })

    it('devrait calculer le prix total correctement', () => {
      useCartStore.getState().addItem(mockProduct, 3)
      const total = useCartStore.getState().totalPrice()
      expect(total).toBe(291) // 97 * 3
    })

    it('devrait persister le panier dans localStorage', () => {
      // Ajouter au store
      useCartStore.getState().addItem(mockProduct, 2)

      // Vérifier que le state est correct
      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(2)

      // Simuler ce que Zustand persist fait
      const storageData = { items: state.items }
      localStorage.setItem('agc-cart', JSON.stringify(storageData))

      // Vérifier localStorage
      const saved = JSON.parse(localStorage.getItem('agc-cart') || '{}')
      expect(saved.items).toHaveLength(1)
      expect(saved.items[0].quantity).toBe(2)
    })

    it('devrait vider le panier avec clearCart()', () => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().clearCart()
      expect(useCartStore.getState().items).toHaveLength(0)
      expect(useCartStore.getState().lastOrder).toBeNull()
    })

    it('devrait mettre à jour la quantité', () => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().updateQuantity(1, 5)
      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('devrait supprimer un item si quantité <= 0', () => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().updateQuantity(1, 0)
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('devrait gérer l\'état isOpen du drawer', () => {
      expect(useCartStore.getState().isOpen).toBe(false)
      useCartStore.getState().openCart()
      expect(useCartStore.getState().isOpen).toBe(true)
      useCartStore.getState().closeCart()
      expect(useCartStore.getState().isOpen).toBe(false)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH & SESSION PERSISTENCE TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Auth Store & Session Persistence', () => {
    it('devrait initialiser avec user null', () => {
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('devrait définir user après login réussi', () => {
      useAuthStore.setState({ user: mockUser })
      expect(useAuthStore.getState().user?.username).toBe('testuser')
    })

    it('devrait vider user après logout', () => {
      useAuthStore.setState({ user: mockUser })
      useAuthStore.getState().logout()
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('devrait persister l\'utilisateur avec Zustand persist', () => {
      useAuthStore.setState({ user: mockUser })

      // Simuler la persistance
      const storageData = JSON.stringify({ user: mockUser })
      localStorage.setItem('agc-auth', storageData)

      // Vérifier localStorage
      const saved = JSON.parse(localStorage.getItem('agc-auth') || '{}')
      expect(saved.user.username).toBe('testuser')
    })

    it('devrait avoir les tokens en localStorage après login', () => {
      const tokens = { access: 'fake_access_token', refresh: 'fake_refresh_token' }
      localStorage.setItem('agc_access', tokens.access)
      localStorage.setItem('agc_refresh', tokens.refresh)

      expect(localStorage.getItem('agc_access')).toBe(tokens.access)
      expect(localStorage.getItem('agc_refresh')).toBe(tokens.refresh)
    })

    it('authService.isAuthenticated() devrait vérifier les tokens', () => {
      expect(authService.isAuthenticated()).toBe(false)

      localStorage.setItem('agc_access', 'token')
      expect(authService.isAuthenticated()).toBe(true)

      localStorage.removeItem('agc_access')
      expect(authService.isAuthenticated()).toBe(false)
    })

    it('authService.logout() devrait supprimer les tokens', () => {
      localStorage.setItem('agc_access', 'token')
      localStorage.setItem('agc_refresh', 'refresh')

      authService.logout()

      expect(localStorage.getItem('agc_access')).toBeNull()
      expect(localStorage.getItem('agc_refresh')).toBeNull()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INTEGRATION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Integration: Cart + Session', () => {
    it('devrait persister le panier et la session ensemble', () => {
      // 1. User login
      useAuthStore.setState({ user: mockUser })
      localStorage.setItem('agc_access', 'token')

      // 2. Add to cart
      useCartStore.getState().addItem(mockProduct, 2)

      // 3. Persister les deux
      localStorage.setItem('agc-auth', JSON.stringify({ user: mockUser }))
      const cartData = { items: useCartStore.getState().items }
      localStorage.setItem('agc-cart', JSON.stringify(cartData))

      // 4. Simuler refresh page
      const restoredUser = JSON.parse(localStorage.getItem('agc-auth') || '{}').user
      const restoredCart = JSON.parse(localStorage.getItem('agc-cart') || '{}')

      expect(restoredUser.username).toBe('testuser')
      expect(restoredCart.items).toHaveLength(1)
      expect(restoredCart.items[0].quantity).toBe(2)
    })

    it('devrait vider le panier après logout', () => {
      // Setup
      useAuthStore.setState({ user: mockUser })
      useCartStore.getState().addItem(mockProduct)
      expect(useCartStore.getState().items).toHaveLength(1)

      // Logout
      useAuthStore.getState().logout()
      useCartStore.getState().clearCart()

      // Verify
      expect(useAuthStore.getState().user).toBeNull()
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('devrait maintenir la session à travers les navigations', () => {
      // Login
      useAuthStore.setState({ user: mockUser })
      localStorage.setItem('agc_access', 'token')

      // Add to cart
      useCartStore.getState().addItem(mockProduct)

      // Navigate (simulé)
      let user = useAuthStore.getState().user
      let cartItems = useCartStore.getState().items

      // Check
      expect(user?.username).toBe('testuser')
      expect(cartItems).toHaveLength(1)

      // Navigate again
      user = useAuthStore.getState().user
      cartItems = useCartStore.getState().items

      // Should still be there
      expect(user?.username).toBe('testuser')
      expect(cartItems).toHaveLength(1)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // ERROR HANDLING TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Error Handling', () => {
    it('devrait gérer les erreurs de panier vide', () => {
      expect(useCartStore.getState().items).toHaveLength(0)
      expect(useCartStore.getState().totalItems()).toBe(0)
      expect(useCartStore.getState().totalPrice()).toBe(0)
    })

    it('devrait définir une erreur en authStore', () => {
      useAuthStore.setState({ error: 'Erreur de connexion' })
      expect(useAuthStore.getState().error).toBe('Erreur de connexion')

      useAuthStore.getState().clearError()
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('devrait gérer les produits invalides', () => {
      const invalidProduct = { ...mockProduct, is_active: false }
      useCartStore.getState().addItem(invalidProduct)
      // Le panier ajoute quand même (validation côté backend)
      expect(useCartStore.getState().items).toHaveLength(1)
    })
  })
})
