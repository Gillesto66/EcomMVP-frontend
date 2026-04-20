// Auteur : Gilles - Projet : AGC Space - Module : Page de vente (SSR)
/**
 * Page de vente publique — rendue côté serveur pour le SEO.
 * Consomme GET /api/v1/render/<productId>/ (mis en cache Redis côté backend).
 * Le Critical CSS est injecté dans le <head> pour éviter le FOUC.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageRenderer from '@/src/modules/renderer/PageRenderer'
import AffiliationInit from '@/src/modules/affiliation/AffiliationInit'
import type { RenderPayload } from '@/src/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function getRenderPayload(productId: string): Promise<RenderPayload | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/render/${productId}/`, {
      next: { revalidate: 300 }, // ISR — revalide toutes les 5 min (cohérent avec le TTL Redis)
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { productId: string } }): Promise<Metadata> {
  const payload = await getRenderPayload(params.productId)
  if (!payload) return { title: 'Produit introuvable' }
  return {
    title: `${payload.product.name} — AGC Space`,
    description: payload.product.description,
  }
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: { productId: string }
  searchParams: Record<string, string>
}) {
  const payload = await getRenderPayload(params.productId)
  if (!payload) notFound()

  return (
    <>
      {/* Injection du Critical CSS dans le <head> — élimine le FOUC */}
      {payload.critical_css && (
        <style dangerouslySetInnerHTML={{ __html: payload.critical_css }} />
      )}

      {/* Initialise le tracking d'affiliation depuis les query params */}
      <AffiliationInit searchParams={searchParams} productId={params.productId} />

      {/* Rendu dynamique des blocs */}
      <PageRenderer payload={payload} />
    </>
  )
}
