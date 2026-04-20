'use client'
export const dynamic = 'force-dynamic'
// Auteur : Gilles - Projet : AGC Space - Module : Checkout - Paiement refusé
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function DeclinedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">

        {/* Carte principale */}
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 text-center space-y-6">

          {/* Icône */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20" />
            <div className="relative w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
              <span className="material-symbols-outlined text-white text-5xl">cancel</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-headline text-3xl font-extrabold text-primary tracking-tight">
              Paiement refusé
            </h1>
            <p className="text-on-surface-variant">
              Votre paiement n&apos;a pas pu être traité.
            </p>
          </div>

          {/* Référence commande */}
          {orderId && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-3 inline-block">
              <p className="text-xs text-red-400 uppercase tracking-widest font-semibold mb-0.5">Référence</p>
              <p className="font-mono font-bold text-red-600">#{orderId}</p>
            </div>
          )}

          {/* Raisons possibles */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 text-left space-y-2">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
              Raisons possibles
            </p>
            {[
              { icon: 'credit_card_off', text: 'Fonds insuffisants sur le compte' },
              { icon: 'lock', text: 'Carte bloquée ou expirée' },
              { icon: 'wifi_off', text: 'Problème de connexion temporaire' },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400 text-base">{icon}</span>
                <span className="text-sm text-on-surface-variant">{text}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            {/* Réessayer */}
            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">refresh</span>
              Réessayer le paiement
            </button>

            {/* Nous contacter */}
            <a
              href="mailto:support@agcspace.com"
              className="w-full py-4 bg-white text-secondary font-bold rounded-2xl text-base border-2 border-secondary/20 hover:bg-secondary/5 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">mail</span>
              Nous contacter
            </a>

            {/* Accueil */}
            <Link
              href="/"
              className="w-full py-3 text-on-surface-variant font-medium rounded-2xl text-sm hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>

        {/* Aide */}
        <div className="bg-white rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-secondary">support_agent</span>
          </div>
          <div>
            <p className="text-sm font-bold text-primary mb-0.5">Besoin d&apos;aide ?</p>
            <p className="text-xs text-on-surface-variant">
              Notre équipe est disponible du lundi au vendredi, 9h–18h.
              Réponse sous 24h.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function CheckoutDeclinedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <DeclinedContent />
    </Suspense>
  )
}
