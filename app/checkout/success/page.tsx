'use client'
export const dynamic = 'force-dynamic'
// Auteur : Gilles - Projet : AGC Space - Module : Checkout - Paiement réussi
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/src/modules/cart/store/cartStore'
import { useAffiliationStore } from '@/src/modules/affiliation/store/affiliationStore'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart, lastOrder } = useCartStore()
  const { clear: clearAffiliation } = useAffiliationStore()

  const sessionId    = searchParams.get('session_id')
  const orderId      = searchParams.get('order_id')
  const orderNumber  = searchParams.get('order_number')

  useEffect(() => {
    clearCart()
    clearAffiliation()
  }, [clearCart, clearAffiliation])

  const displayNumber = orderNumber
    ? decodeURIComponent(orderNumber)
    : orderId
    ? `#${orderId}`
    : lastOrder?.order_number || null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">

        {/* Carte principale */}
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 text-center space-y-6">

          {/* Icône animée */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
            <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
              <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-headline text-3xl font-extrabold text-primary tracking-tight">
              Paiement réussi !
            </h1>
            <p className="text-on-surface-variant">
              Votre commande a été confirmée avec succès.
            </p>
          </div>

          {/* Numéro de commande */}
          {displayNumber && (
            <div className="bg-surface-container-lowest rounded-2xl px-6 py-4 inline-block mx-auto">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold mb-1">
                Numéro de commande
              </p>
              <p className="font-mono font-black text-primary text-lg">{displayNumber}</p>
            </div>
          )}

          {/* Session Stripe si présente */}
          {sessionId && (
            <p className="text-[10px] text-gray-300 font-mono">Session : {sessionId}</p>
          )}

          {/* Commission affilié */}
          {lastOrder?.commission && (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-green-600 text-sm">hub</span>
                <p className="text-sm font-semibold text-green-700">Commission affilié générée</p>
              </div>
              <p className="text-xl font-black text-green-600">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(lastOrder.commission.amount))}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href="/shop"
              className="flex flex-col items-center gap-2 py-4 px-3 bg-surface-container-lowest rounded-2xl hover:bg-surface-container transition-colors group"
            >
              <span className="material-symbols-outlined text-secondary text-2xl group-hover:scale-110 transition-transform">storefront</span>
              <span className="text-xs font-bold text-on-surface-variant">Boutique</span>
            </Link>
            <Link
              href="/"
              className="flex flex-col items-center gap-2 py-4 px-3 bg-primary rounded-2xl hover:opacity-90 transition-opacity group"
            >
              <span className="material-symbols-outlined text-white text-2xl group-hover:scale-110 transition-transform">home</span>
              <span className="text-xs font-bold text-white">Accueil</span>
            </Link>
          </div>

          {/* Lien commandes */}
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-1.5 text-sm text-secondary font-semibold hover:underline"
          >
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            Voir mes commandes
          </Link>
        </div>

        {/* Message de confiance */}
        <p className="text-center text-xs text-gray-400">
          Un email de confirmation vous sera envoyé prochainement.
        </p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
