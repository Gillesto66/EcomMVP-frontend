// Auteur : Gilles - Projet : AGC Space - Module : Cart - Store Zustand
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, Product, Order } from '@/src/types'
import apiClient from '@/src/lib/api'

// SSR-safe storage : évalué à l'exécution (pas au module-level)
const ssrSafeStorage = createJSONStorage(() =>
  typeof window !== 'undefined' ? localStorage : ({
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  } as unknown as Storage)
)

const LOG_PREFIX = '[AGC Cart]'

interface StockValidationResult {
  valid: boolean
  unavailable: { productId: number; productName: string; reason: string }[]
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isCheckingOut: boolean
  lastOrder: Order | null
  error: string | null
  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  checkout: (referralCode?: string, stripePaymentIntentId?: string) => Promise<Order>
  /**
   * Valide le stock côté backend avant le checkout.
   * Retire les produits indisponibles du panier et retourne le résultat.
   */
  validateStock: () => Promise<StockValidationResult>
  // Computed
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isCheckingOut: false,
      lastOrder: null,
      error: null,

      addItem: (product, quantity = 1) => {
        // Validation quantité positive
        if (quantity < 1) {
          console.warn(LOG_PREFIX, 'addItem: quantité invalide', quantity)
          return
        }
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            const newQty = existing.quantity + quantity
            // Respect du stock pour les produits physiques
            const maxQty = product.is_digital ? Infinity : product.stock
            const clampedQty = Math.min(newQty, maxQty)
            if (clampedQty < newQty) {
              console.warn(LOG_PREFIX, `Stock limité pour "${product.name}" : max ${maxQty}`)
            }
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: clampedQty } : i
              ),
            }
          }
          // Vérification stock initial
          if (!product.is_digital && product.stock < 1) {
            console.warn(LOG_PREFIX, `Produit "${product.name}" en rupture de stock`)
            return state // Ne pas ajouter un produit en rupture
          }
          const safeQty = product.is_digital ? quantity : Math.min(quantity, product.stock)
          console.info(LOG_PREFIX, `Ajout "${product.name}" × ${safeQty}`)
          return { items: [...state.items, { product, quantity: safeQty }] }
        })
      },

      removeItem: (productId) => {
        console.info(LOG_PREFIX, `Suppression produit #${productId}`)
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => {
          const item = state.items.find((i) => i.product.id === productId)
          if (!item) return state
          // Respect du stock pour les produits physiques
          const maxQty = item.product.is_digital ? Infinity : item.product.stock
          const safeQty = Math.min(quantity, maxQty)
          if (safeQty < quantity) {
            console.warn(LOG_PREFIX, `Quantité limitée au stock disponible : ${maxQty}`)
          }
          return {
            items: state.items.map((i) =>
              i.product.id === productId ? { ...i, quantity: safeQty } : i
            ),
          }
        })
      },

      clearCart: () => {
        console.info(LOG_PREFIX, 'Panier vidé')
        set({ items: [], lastOrder: null })
      },
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      /**
       * Valide le stock côté backend avant le checkout.
       * Retire automatiquement les produits indisponibles du panier.
       * Retourne la liste des produits retirés pour affichage à l'utilisateur.
       */
      validateStock: async (): Promise<StockValidationResult> => {
        const { items } = get()
        if (items.length === 0) return { valid: true, unavailable: [] }

        const unavailable: StockValidationResult['unavailable'] = []

        try {
          // Vérification en parallèle de chaque produit
          const checks = await Promise.allSettled(
            items.map(async (item) => {
              const { data } = await apiClient.get<{ id: number; stock: number; is_active: boolean; is_digital: boolean }>(
                `/products/${item.product.id}/`
              )
              return { item, fresh: data }
            })
          )

          const validItems: CartItem[] = []
          for (const result of checks) {
            if (result.status === 'rejected') {
              // Produit inaccessible → retirer du panier
              console.warn(LOG_PREFIX, 'Produit inaccessible lors de la validation stock')
              continue
            }
            const { item, fresh } = result.value
            if (!fresh.is_active) {
              unavailable.push({
                productId: item.product.id,
                productName: item.product.name,
                reason: 'Produit désactivé',
              })
              console.warn(LOG_PREFIX, `Produit "${item.product.name}" désactivé — retiré du panier`)
            } else if (!fresh.is_digital && fresh.stock < item.quantity) {
              if (fresh.stock === 0) {
                unavailable.push({
                  productId: item.product.id,
                  productName: item.product.name,
                  reason: 'Rupture de stock',
                })
                console.warn(LOG_PREFIX, `Produit "${item.product.name}" en rupture — retiré du panier`)
              } else {
                // Stock partiel : ajuster la quantité
                validItems.push({ ...item, quantity: fresh.stock })
                console.info(LOG_PREFIX, `Quantité ajustée pour "${item.product.name}" : ${item.quantity} → ${fresh.stock}`)
              }
            } else {
              validItems.push(item)
            }
          }

          if (unavailable.length > 0 || validItems.some((vi, i) => vi.quantity !== items[i]?.quantity)) {
            // Mettre à jour le panier : retirer les indisponibles + ajuster les quantités
            const unavailableIds = new Set(unavailable.map((u) => u.productId))
            set({
              items: validItems.filter((i) => !unavailableIds.has(i.product.id)),
            })
          }

          const valid = unavailable.length === 0
          console.info(LOG_PREFIX, `Validation stock : ${valid ? 'OK' : `${unavailable.length} produit(s) retiré(s)`}`)
          return { valid, unavailable }
        } catch (err) {
          console.error(LOG_PREFIX, 'Erreur validation stock :', err)
          // En cas d'erreur réseau, on laisse le backend gérer
          return { valid: true, unavailable: [] }
        }
      },

      /**
       * Envoie la commande au backend Django.
       * Inclut le referral_code si un cookie d'affiliation est présent.
       * Inclut le stripe_payment_intent_id si fourni (paiement Stripe).
       */
      checkout: async (referralCode, stripePaymentIntentId) => {
        const { items } = get()
        if (items.length === 0) throw new Error('Panier vide')

        set({ isCheckingOut: true, error: null })
        console.info(LOG_PREFIX, `Checkout — ${items.length} article(s), referral: ${referralCode ?? 'aucun'}`)

        try {
          const payload: Record<string, unknown> = {
            items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
          }
          if (referralCode) payload.referral_code = referralCode
          if (stripePaymentIntentId) payload.stripe_payment_intent_id = stripePaymentIntentId

          const { data } = await apiClient.post<Order>('/orders/create/', payload)
          console.info(LOG_PREFIX, `Commande créée : ${data.order_number} — total: ${data.total}€`)
          set({ lastOrder: data, items: [], isCheckingOut: false })
          return data
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Erreur lors de la commande'
          console.error(LOG_PREFIX, 'Erreur checkout :', msg)
          set({ error: msg, isCheckingOut: false })
          throw err
        }
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
    }),
    {
      name: 'agc-cart',
      storage: ssrSafeStorage,
      partialize: (state) => ({ items: state.items }),
    }
  )
)
