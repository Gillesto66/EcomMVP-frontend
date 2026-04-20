// Auteur : Gilles - Projet : AGC Space - Module : Tests - CartStore
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCartStore } from '../modules/cart/store/cartStore'
import type { Product } from '../types'

// Mock apiClient pour validateStock
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockProduct: Product = {
  id: 1, owner: 1, owner_username: 'vendeur',
  name: 'Formation Django', description: '', price: '97.00',
  sku: 'FORM-001', is_digital: true, is_active: true, stock: 10,
  views_count: 0, category: '', created_at: '', updated_at: '',
}

const mockPhysique: Product = {
  id: 2, owner: 1, owner_username: 'vendeur',
  name: 'Livre Python', description: '', price: '29.99',
  sku: 'LIVRE-001', is_digital: false, is_active: true, stock: 5,
  views_count: 0, category: '', created_at: '', updated_at: '',
}

describe('CartStore — opérations de base', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false, lastOrder: null, error: null })
  })

  it('ajoute un produit au panier', () => {
    useCartStore.getState().addItem(mockProduct)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(1)
  })

  it('incrémente la quantité si le produit existe déjà', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().addItem(mockProduct)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('supprime un produit', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().removeItem(1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('calcule le total correctement', () => {
    useCartStore.getState().addItem(mockProduct, 2)
    expect(useCartStore.getState().totalPrice()).toBe(194)
  })

  it('calcule le nombre total d\'articles', () => {
    useCartStore.getState().addItem(mockProduct, 3)
    expect(useCartStore.getState().totalItems()).toBe(3)
  })

  it('vide le panier', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('met à jour la quantité', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().updateQuantity(1, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('supprime le produit si quantité = 0', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().updateQuantity(1, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('supprime le produit si quantité négative', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().updateQuantity(1, -1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('CartStore — validation stock produits physiques', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false, lastOrder: null, error: null })
  })

  it('ne dépasse pas le stock disponible lors de l\'ajout', () => {
    // Stock = 5, on essaie d'ajouter 10
    useCartStore.getState().addItem(mockPhysique, 10)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('ne dépasse pas le stock lors de l\'incrémentation', () => {
    useCartStore.getState().addItem(mockPhysique, 4)
    useCartStore.getState().addItem(mockPhysique, 3) // total voulu = 7, max = 5
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('ne dépasse pas le stock lors de updateQuantity', () => {
    useCartStore.getState().addItem(mockPhysique, 1)
    useCartStore.getState().updateQuantity(2, 99)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('n\'ajoute pas un produit physique en rupture de stock', () => {
    const rupture: Product = { ...mockPhysique, id: 3, stock: 0 }
    useCartStore.getState().addItem(rupture)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('les produits digitaux ignorent la limite de stock', () => {
    useCartStore.getState().addItem(mockProduct, 100)
    expect(useCartStore.getState().items[0].quantity).toBe(100)
  })

  it('n\'ajoute pas un produit avec quantité invalide (0)', () => {
    useCartStore.getState().addItem(mockProduct, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('CartStore — validateStock', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false, lastOrder: null, error: null })
    vi.clearAllMocks()
  })

  it('retourne valid=true si panier vide', async () => {
    const result = await useCartStore.getState().validateStock()
    expect(result.valid).toBe(true)
    expect(result.unavailable).toHaveLength(0)
  })

  it('retourne valid=true si tous les produits sont disponibles', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockResolvedValue({
      data: { id: 1, stock: 10, is_active: true, is_digital: true },
    })
    useCartStore.getState().addItem(mockProduct, 2)
    const result = await useCartStore.getState().validateStock()
    expect(result.valid).toBe(true)
    expect(result.unavailable).toHaveLength(0)
  })

  it('retire un produit désactivé et le signale', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockResolvedValue({
      data: { id: 1, stock: 10, is_active: false, is_digital: true },
    })
    useCartStore.getState().addItem(mockProduct, 1)
    const result = await useCartStore.getState().validateStock()
    expect(result.valid).toBe(false)
    expect(result.unavailable).toHaveLength(1)
    expect(result.unavailable[0].reason).toBe('Produit désactivé')
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('retire un produit en rupture de stock et le signale', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockResolvedValue({
      data: { id: 2, stock: 0, is_active: true, is_digital: false },
    })
    useCartStore.getState().addItem(mockPhysique, 2)
    const result = await useCartStore.getState().validateStock()
    expect(result.valid).toBe(false)
    expect(result.unavailable[0].reason).toBe('Rupture de stock')
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('ajuste la quantité si stock partiel', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockResolvedValue({
      data: { id: 2, stock: 2, is_active: true, is_digital: false },
    })
    // Forcer la quantité à 5 pour le test (bypass de la validation locale)
    useCartStore.setState({ items: [{ product: mockPhysique, quantity: 5 }] })
    const result = await useCartStore.getState().validateStock()
    // Stock partiel → pas dans unavailable, quantité ajustée
    expect(result.valid).toBe(true)
    expect(result.unavailable).toHaveLength(0)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('retourne valid=true en cas d\'erreur réseau (fallback gracieux)', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockRejectedValue(new Error('Network error'))
    useCartStore.getState().addItem(mockProduct, 1)
    const result = await useCartStore.getState().validateStock()
    // En cas d'erreur réseau, on laisse le backend gérer
    expect(result.valid).toBe(true)
  })
})

describe('CartStore — checkout', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false, lastOrder: null, error: null })
    vi.clearAllMocks()
  })

  it('lance une erreur si le panier est vide', async () => {
    await expect(useCartStore.getState().checkout()).rejects.toThrow('Panier vide')
  })

  it('envoie le referral_code si présent', async () => {
    const apiClient = await import('../lib/api')
    const mockOrder = {
      id: 1, order_number: 'ORD-2026-000001', total: '97.00',
      status: 'pending', items: [], commission: null,
      customer: 1, customer_username: 'client', created_at: '', updated_at: '',
    }
    vi.mocked(apiClient.default.post).mockResolvedValue({ data: mockOrder })
    useCartStore.getState().addItem(mockProduct, 1)
    const order = await useCartStore.getState().checkout('REF_CODE_123')
    expect(apiClient.default.post).toHaveBeenCalledWith(
      '/orders/create/',
      expect.objectContaining({ referral_code: 'REF_CODE_123' })
    )
    expect(order.order_number).toBe('ORD-2026-000001')
  })

  it('vide le panier après un checkout réussi', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.post).mockResolvedValue({
      data: {
        id: 1, order_number: 'ORD-2026-000002', total: '97.00',
        status: 'pending', items: [], commission: null,
        customer: 1, customer_username: 'client', created_at: '', updated_at: '',
      },
    })
    useCartStore.getState().addItem(mockProduct, 1)
    await useCartStore.getState().checkout()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('stocke l\'erreur et ne vide pas le panier en cas d\'échec', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.post).mockRejectedValue(new Error('Stock insuffisant'))
    useCartStore.getState().addItem(mockProduct, 1)
    await expect(useCartStore.getState().checkout()).rejects.toThrow()
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().error).toBeTruthy()
  })

  it('inclut stripe_payment_intent_id si fourni', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.post).mockResolvedValue({
      data: {
        id: 1, order_number: 'ORD-2026-000003', total: '97.00',
        status: 'pending', items: [], commission: null,
        customer: 1, customer_username: 'client', created_at: '', updated_at: '',
      },
    })
    useCartStore.getState().addItem(mockProduct, 1)
    await useCartStore.getState().checkout(undefined, 'pi_test_123')
    expect(apiClient.default.post).toHaveBeenCalledWith(
      '/orders/create/',
      expect.objectContaining({ stripe_payment_intent_id: 'pi_test_123' })
    )
  })
})
