// Auteur : Gilles - Projet : AGC Space - Module : Affiliation - Store Zustand
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import apiClient from '@/src/lib/api'
import type { AffiliationValidation } from '@/src/types'

const COOKIE_NAME = 'agc_ref'
const COOKIE_DAYS = Number(process.env.NEXT_PUBLIC_AFFILIATION_COOKIE_DAYS ?? 30)

// SSR-safe storage : évalué à l'exécution (pas au module-level)
const ssrSafeStorage = createJSONStorage(() =>
  typeof window !== 'undefined' ? localStorage : ({
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  } as unknown as Storage)
)

// Lazy import de js-cookie pour éviter l'accès à document au niveau module (SSR)
const getCookies = async () => {
  if (typeof window === 'undefined') return null
  const { default: Cookies } = await import('js-cookie')
  return Cookies
}

interface AffiliationState {
  trackingCode: string | null
  isValidated: boolean
  initFromUrl: (searchParams: URLSearchParams) => Promise<void>
  initFromCookie: () => void
  clear: () => void
}

export const useAffiliationStore = create<AffiliationState>()(
  persist(
    (set) => ({
      trackingCode: null,
      isValidated: false,

      initFromUrl: async (searchParams) => {
        const ref = searchParams.get('ref')
        const sig = searchParams.get('sig')
        const exp = searchParams.get('exp')
        const product_id = searchParams.get('product_id')

        if (!ref || !sig || !exp || !product_id) return

        try {
          const { data } = await apiClient.get<AffiliationValidation>(
            `/affiliations/validate/?ref=${ref}&sig=${sig}&exp=${exp}&product_id=${product_id}`
          )
          if (data.valid && data.tracking_code) {
            const Cookies = await getCookies()
            if (Cookies) {
              Cookies.set(COOKIE_NAME, data.tracking_code, {
                expires: COOKIE_DAYS,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              })
            }
            set({ trackingCode: data.tracking_code, isValidated: true })
            console.info('[AGC Affiliation] Tracking code validé et cookie posé :', data.tracking_code)
          }
        } catch (err) {
          console.warn('[AGC Affiliation] Validation échouée :', err)
        }
      },

      initFromCookie: async () => {
        const Cookies = await getCookies()
        if (!Cookies) return
        const code = Cookies.get(COOKIE_NAME)
        if (code) set({ trackingCode: code, isValidated: true })
      },

      clear: async () => {
        const Cookies = await getCookies()
        if (Cookies) Cookies.remove(COOKIE_NAME)
        set({ trackingCode: null, isValidated: false })
      },
    }),
    {
      name: 'agc-affiliation',
      storage: ssrSafeStorage,
      partialize: (state) => ({ trackingCode: state.trackingCode }),
    }
  )
)
