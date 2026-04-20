// Auteur : Gilles - Projet : AGC Space - Module : Dashboard Vendeur - Service
import apiClient from '@/src/lib/api'
import type { Product, VendeurOrder, VendeurAffiliate, VendeurCommission } from '@/src/types'

const LOG_PREFIX = '[AGC Vendeur]'

export interface VendeurStats {
  total_revenue: string
  active_products_count: number
  active_affiliates_count: number
  avg_commission_pct: number
  total_affiliate_gain: string
  top_product: Product | null
  products: Product[]
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const vendeurService = {
  async getStats(): Promise<VendeurStats> {
    console.info(LOG_PREFIX, 'Chargement stats vendeur')
    const { data } = await apiClient.get<VendeurStats>('/dashboard/stats/')
    return data
  },

  /** Commandes contenant les produits du vendeur */
  async getOrders(status?: string): Promise<VendeurOrder[]> {
    const params = status ? `?status=${status}` : ''
    console.info(LOG_PREFIX, `Chargement commandes vendeur${status ? ` (statut: ${status})` : ''}`)
    const { data } = await apiClient.get<PaginatedResponse<VendeurOrder> | VendeurOrder[]>(
      `/orders/vendeur/${params}`
    )
    // Gestion pagination ou liste directe
    if (Array.isArray(data)) return data
    return (data as PaginatedResponse<VendeurOrder>).results ?? []
  },

  /** Affiliés actifs sur les produits du vendeur */
  async getAffiliates(): Promise<VendeurAffiliate[]> {
    console.info(LOG_PREFIX, 'Chargement affiliés vendeur')
    const { data } = await apiClient.get<VendeurAffiliate[]>('/affiliations/vendeur/affiliates/')
    return data
  },

  /** Commissions générées sur les produits du vendeur */
  async getCommissions(status?: string): Promise<VendeurCommission[]> {
    const params = status ? `?status=${status}` : ''
    console.info(LOG_PREFIX, `Chargement commissions vendeur${status ? ` (statut: ${status})` : ''}`)
    const { data } = await apiClient.get<PaginatedResponse<VendeurCommission> | VendeurCommission[]>(
      `/affiliations/vendeur/commissions/${params}`
    )
    if (Array.isArray(data)) return data
    return (data as PaginatedResponse<VendeurCommission>).results ?? []
  },

  /** Valide ou annule une commission */
  async updateCommission(
    commissionId: number,
    action: 'validate' | 'cancel'
  ): Promise<{ detail: string; status: string }> {
    console.info(LOG_PREFIX, `Commission #${commissionId} — action: ${action}`)
    const { data } = await apiClient.patch<{ detail: string; status: string }>(
      `/affiliations/vendeur/commissions/${commissionId}/validate/`,
      { action }
    )
    return data
  },
}
