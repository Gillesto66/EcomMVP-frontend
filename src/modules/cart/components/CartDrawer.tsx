'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Cart - CartDrawer
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '../store/cartStore'
import { useAffiliationStore } from '@/src/modules/affiliation/store/affiliationStore'
import { formatPrice, cn } from '@/src/lib/utils'

export default function CartDrawer() {
  const router = useRouter()
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore()
  const { trackingCode } = useAffiliationStore()

  // Écoute l'événement custom du BuyButtonBlock
  useEffect(() => {
    const handler = () => useCartStore.getState().openCart()
    window.addEventListener('agc:open-cart', handler)
    return () => window.removeEventListener('agc:open-cart', handler)
  }, [])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={closeCart} />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Mon panier ({totalItems()})</h2>
          <button onClick={closeCart} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-12">Votre panier est vide</p>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-4 py-3 border-b">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product.name}</p>
                  <p className="text-primary font-bold">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100">−</button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
                </div>
                <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-4 border-t space-y-3">
            {trackingCode && (
              <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-theme">
                ✓ Lien affilié actif
              </p>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(totalPrice())}</span>
            </div>
            <button
              onClick={() => { closeCart(); router.push('/checkout') }}
              className="w-full py-3 bg-primary text-white font-bold rounded-theme hover:opacity-90 transition-opacity"
            >
              Passer la commande
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
