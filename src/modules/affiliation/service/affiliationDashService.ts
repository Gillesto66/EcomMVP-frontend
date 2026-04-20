// Auteur : Gilles - Projet : AGC Space - Module : Affiliation - Dashboard Service
import apiClient from '@/src/lib/api'
import type { AffiliationLink, Commission, Product } from '@/src/types'

export interface AffiliationStats {
  total_links: number
  active_links: number
  total_commissions: number
  total_earned: string
  pending_amount: string
  validated_amount: string
  total_orders_generated: number
  available_products_count: number
  conversion_rate: number
}

export interface MarketplaceProduct extends Product {
  my_link: {
    tracking_code: string
    commission_rate: string
    commission_display: string
    is_active: boolean
  } | null
}

export const affiliationDashService = {
  async getStats(): Promise<AffiliationStats> {
    const { data } = await apiClient.get<AffiliationStats>('/affiliations/links/stats/')
    return data
  },

  async getLinks(): Promise<AffiliationLink[]> {
    const { data } = await apiClient.get<{ results?: AffiliationLink[] } | AffiliationLink[]>('/affiliations/links/')
    if (Array.isArray(data)) return data
    return (data as { results?: AffiliationLink[] }).results ?? []
  },

  async getCommissions(): Promise<Commission[]> {
    const { data } = await apiClient.get<{ results?: Commission[] } | Commission[]>('/affiliations/commissions/')
    if (Array.isArray(data)) return data
    return (data as { results?: Commission[] }).results ?? []
  },

  async getMarketplace(): Promise<MarketplaceProduct[]> {
    const { data } = await apiClient.get<MarketplaceProduct[]>('/affiliations/marketplace/')
    return data
  },

  async generateSignedUrl(linkId: number): Promise<{ url: string }> {
    const { data } = await apiClient.post(`/affiliations/links/${linkId}/signed-url/`)
    return data
  },

  async createLink(productId: number, commissionRate: string): Promise<AffiliationLink> {
    const { data } = await apiClient.post<AffiliationLink>('/affiliations/links/', {
      product: productId,
      commission_rate: commissionRate,
    })
    return data
  },
}
