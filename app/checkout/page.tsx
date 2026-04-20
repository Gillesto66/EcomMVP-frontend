'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Checkout
// MVP : modale de simulation de statut paiement après confirmation commande
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/src/modules/cart/store/cartStore'
import { useAffiliationStore } from '@/src/modules/affiliation/store/affiliationStore'
import { useAuthStore } from '@/src/modules/auth/store/authStore'
import { stripeService } from '@/src/modules/stripe/stripeService'
import { formatPrice, cn } from '@/src/lib/utils'
import { toast } from '@/src/components/ui/Toast'
import type { Order } from '@/src/types'

const STRIPE_ENABLED = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export const dynamic = 'force-dynamic'

// ── Modale MVP : simulation statut paiement ───────────────────────────────────

function PaymentStatusModal({
  order,
  onValidate,
  onDecline,
}: {
  order: Order
  onValidate: () => void
  onDecline: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-payment-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Carte */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 space-y-6">
        {/* Badge MVP */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow">
            Mode MVP
          </span>
        </div>

        {/* Icône + titre */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl text-white">credit_card</span>
          </div>
          <h2 id="modal-payment-title" className="text-xl font-black text-primary font-headline">
            Simuler le paiement
          </h2>
          <p className="text-sm text-on-surface-variant">
            Commande <span className="font-mono font-semibold text-primary">{order.order_number || `#${order.id}`}</span>
          </p>
          <p className="text-2xl font-black text-primary">{formatPrice(order.total)}</p>
        </div>

        <p className="text-xs text-center text-gray-400 bg-gray-50 rounded-xl px-4 py-2">
          En production, cette étape est gérée par Stripe.<br />
          Choisissez le résultat à simuler :
        </p>

        {/* Boutons */}
        <div className="space-y-3">
          <button
            onClick={onValidate}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Paiement accepté ✓
          </button>
          <button
            onClick={onDecline}
            className="w-full py-4 bg-white text-red-500 font-bold rounded-2xl text-base border-2 border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">cancel</span>
            Paiement refusé ✗
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page Checkout ─────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const {
    items, totalPrice, checkout, validateStock,
    isCheckingOut, lastOrder, error, clearCart,
  } = useCartStore()
  const { trackingCode, clear: clearAffiliation } = useAffiliationStore()
  const { user } = useAuthStore()
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stockWarnings, setStockWarnings] = useState<string[]>([])
  const [isValidatingStock, setIsValidatingStock] = useState(false)
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null)

  // Validation stock au montage
  useEffect(() => {
    if (items.length === 0) return
    const check = async () => {
      setIsValidatingStock(true)
      const result = await validateStock()
      if (!result.valid && result.unavailable.length > 0) {
        const warnings = result.unavailable.map((u) => `"${u.productName}" retiré : ${u.reason}`)
        setStockWarnings(warnings)
        warnings.forEach((w) => toast(w, 'error'))
      }
      setIsValidatingStock(false)
    }
    check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!user) { router.push('/login'); return null }
  if (items.length === 0 && !pendingOrder) { router.push('/'); return null }

  // ── Stripe ────────────────────────────────────────────────────────────────
  const handleStripe = async () => {
    setStripeLoading(true)
    try {
      await stripeService.redirectToCheckout(items, trackingCode ?? undefined)
    } catch {
      toast('Erreur lors de la redirection Stripe', 'error')
      setStripeLoading(false)
    }
  }

  // ── MVP : créer la commande puis afficher la modale ───────────────────────
  const handleDirectCheckout = async () => {
    try {
      const order = await checkout(trackingCode ?? undefined)
      clearAffiliation()
      setPendingOrder(order)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la commande'
      toast(msg, 'error')
    }
  }

  // ── Résolution modale ─────────────────────────────────────────────────────
  const handleValidate = () => {
    if (!pendingOrder) return
    clearCart()
    router.push(`/checkout/success?order_id=${pendingOrder.id}&order_number=${encodeURIComponent(pendingOrder.order_number || '')}`)
  }

  const handleDecline = () => {
    if (!pendingOrder) return
    // On garde le panier vide (commande déjà créée) mais on redirige vers declined
    router.push(`/checkout/declined?order_id=${pendingOrder.id}`)
  }

  return (
    <>
      {/* Modale MVP — s'affiche après création de la commande */}
      {pendingOrder && (
        <PaymentStatusModal
          order={pendingOrder}
          onValidate={handleValidate}
          onDecline={handleDecline}
        />
      )}

      <div className={cn('min-h-screen bg-gray-50 px-4 py-12', pendingOrder ? 'blur-sm pointer-events-none' : '')}>
        <div className="max-w-lg mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Récapitulatif</h1>

          {/* Avertissements stock */}
          {stockWarnings.length > 0 && (
            <div role="alert" className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-theme text-sm space-y-1">
              <p className="font-semibold">Certains articles ont été retirés de votre panier :</p>
              <ul className="list-disc list-inside space-y-0.5">
                {stockWarnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {isValidatingStock && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              Vérification du stock…
            </div>
          )}

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-theme text-sm">
              {error}
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-theme shadow-sm divide-y">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center px-6 py-4">
                <div>
                  <p className="font-medium text-sm">{item.product.name}</p>
                  <p className="text-xs text-gray-500">
                    Qté : {item.quantity} × {formatPrice(item.product.price)}
                    {!item.product.is_digital && (
                      <span className="ml-2 text-gray-400">(stock : {item.product.stock})</span>
                    )}
                  </p>
                </div>
                <p className="font-bold">{formatPrice(Number(item.product.price) * item.quantity)}</p>
              </div>
            ))}
            <div className="flex justify-between items-center px-6 py-4 font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalPrice())}</span>
            </div>
          </div>

          {trackingCode && (
            <p className="text-xs text-green-600 bg-green-50 px-4 py-2 rounded-theme border border-green-200">
              ✓ Achat via lien affilié — commission calculée automatiquement
            </p>
          )}

          {/* Boutons paiement */}
          <div className="space-y-3">
            {STRIPE_ENABLED && (
              <button
                onClick={handleStripe}
                disabled={stripeLoading || isValidatingStock}
                className={cn(
                  'w-full py-4 bg-[#635BFF] text-white font-bold rounded-theme text-lg',
                  'hover:opacity-90 transition-opacity disabled:opacity-50',
                  'flex items-center justify-center gap-2'
                )}
              >
                {stripeLoading ? 'Redirection…' : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                    </svg>
                    Payer avec Stripe
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleDirectCheckout}
              disabled={isCheckingOut || isValidatingStock}
              className="w-full py-4 bg-primary text-white font-bold rounded-theme text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isCheckingOut ? 'Traitement…' : STRIPE_ENABLED ? 'Payer (test sans Stripe)' : 'Confirmer la commande'}
            </button>
          </div>

          <p className="text-xs text-center text-gray-400">
            🔒 Paiement sécurisé — Vos données sont protégées
          </p>
        </div>
      </div>
    </>
  )
}
