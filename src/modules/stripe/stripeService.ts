// Auteur : Gilles - Projet : AGC Space - Module : Stripe - Service
/**
 * Intégration Stripe Checkout (mode hosted).
 * Le backend Django crée la session Stripe, le front redirige vers Stripe.
 *
 * Pour activer :
 *   1. pip install stripe (backend)
 *   2. Ajouter STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET dans .env
 *   3. npm install @stripe/stripe-js (frontend)
 *   4. Ajouter NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY dans .env.local
 *
 * Flow :
 *   POST /api/v1/orders/create-checkout-session/ → { session_url }
 *   → Redirect vers Stripe Hosted Checkout
 *   → Stripe webhook → POST /api/v1/orders/webhook/ → Order.status = 'paid'
 *   → Redirect vers /checkout/success?order_id=X
 */
import apiClient from '@/src/lib/api'
import type { CartItem } from '@/src/types'

export interface StripeCheckoutPayload {
  items: { product_id: number; quantity: number }[]
  referral_code?: string
  success_url: string
  cancel_url: string
}

export interface StripeSessionResponse {
  session_url: string
  session_id: string
}

export const stripeService = {
  /**
   * Crée une session Stripe Checkout côté backend et retourne l'URL de redirection.
   * Le backend calcule les prix — le front ne transmet jamais de montants.
   */
  async createCheckoutSession(
    items: CartItem[],
    referralCode?: string
  ): Promise<StripeSessionResponse> {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const payload: StripeCheckoutPayload = {
      items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      referral_code: referralCode,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    }
    const { data } = await apiClient.post<StripeSessionResponse>(
      '/orders/create-checkout-session/',
      payload
    )
    return data
  },

  /** Redirige vers Stripe Hosted Checkout */
  async redirectToCheckout(items: CartItem[], referralCode?: string): Promise<void> {
    const { session_url } = await stripeService.createCheckoutSession(items, referralCode)
    if (typeof window !== 'undefined') {
      window.location.href = session_url
    }
  },
}
