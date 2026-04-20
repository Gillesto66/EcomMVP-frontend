'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Affiliation - Init
// Composant client léger — initialise le tracking depuis les query params
import { useEffect } from 'react'
import { useAffiliationStore } from './store/affiliationStore'

interface Props {
  searchParams: Record<string, string>
  productId: string
}

export default function AffiliationInit({ searchParams, productId }: Props) {
  const { initFromUrl, initFromCookie } = useAffiliationStore()

  useEffect(() => {
    // Priorité 1 : query params (nouveau clic sur lien affilié)
    const params = new URLSearchParams({ ...searchParams, product_id: productId })
    if (searchParams.ref && searchParams.sig) {
      initFromUrl(params)
    } else {
      // Priorité 2 : cookie existant (visite de retour)
      initFromCookie()
    }
  }, [searchParams, productId, initFromUrl, initFromCookie])

  return null
}
