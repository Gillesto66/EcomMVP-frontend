// Auteur : Gilles - Projet : AGC Space - Module : Tests - VendeurService
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { vendeurService } from '../modules/dashboard/pages/vendeurService'

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

const mockOrder = {
  id: 1,
  order_number: 'ORD-2026-000001',
  customer_username: 'client',
  status: 'paid' as const,
  total: '97.00',
  items: [{ id: 1, product: 1, product_name: 'Formation Django', quantity: 1, unit_price: '97.00', subtotal: '97.00' }],
  commission: null,
  paid_at: '2026-04-19T10:00:00Z',
  created_at: '2026-04-19T09:00:00Z',
}

const mockAffiliate = {
  link_id: 1,
  affiliate_username: 'affilie',
  product_name: 'Formation Django',
  product_id: 1,
  commission_rate: '0.1500',
  commission_display: '15.0%',
  is_active: true,
  clicks_count: 42,
  total_commissions: 3,
  total_earned: '43.65',
  pending_amount: '14.55',
  created_at: '2026-04-01T00:00:00Z',
}

const mockCommission = {
  id: 1,
  order_number: 'ORD-2026-000001',
  product_name: 'Formation Django',
  affiliate_username: 'affilie',
  order_total: '97.00',
  commission_rate: '0.1500',
  commission_display: '15.0%',
  amount: '14.55',
  status: 'pending' as const,
  validated_at: null,
  created_at: '2026-04-19T09:00:00Z',
}

describe('vendeurService.getOrders', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retourne une liste de commandes (réponse directe)', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockResolvedValue({ data: [mockOrder] })
    const orders = await vendeurService.getOrders()
    expect(orders).toHaveLength(1)
    expect(orders[0].order_number).toBe('ORD-2026-000001')
  })

  it('retourne les résultats d\'une réponse paginée', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockResolvedValue({
      data: { count: 1, next: null, previous: null, results: [mockOrder] },
    })
    const orders = await vendeurService.getOrders()
    expect(orders).toHaveLength(1)
  })

  it('passe le filtre de statut dans l\'URL', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockResolvedValue({ data: [] })
    await vendeurService.getOrders('paid')
    expect(apiClient.default.get).toHaveBeenCalledWith('/orders/vendeur/?status=paid')
  })

  it('retourne un tableau vide si aucune commande', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockResolvedValue({ data: [] })
    const orders = await vendeurService.getOrders()
    expect(orders).toHaveLength(0)
  })
})

describe('vendeurService.getAffiliates', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retourne la liste des affiliés', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockResolvedValue({ data: [mockAffiliate] })
    const affiliates = await vendeurService.getAffiliates()
    expect(affiliates).toHaveLength(1)
    expect(affiliates[0].affiliate_username).toBe('affilie')
    expect(affiliates[0].clicks_count).toBe(42)
  })
})

describe('vendeurService.getCommissions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retourne la liste des commissions', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockResolvedValue({ data: [mockCommission] })
    const commissions = await vendeurService.getCommissions()
    expect(commissions).toHaveLength(1)
    expect(commissions[0].status).toBe('pending')
  })

  it('filtre par statut', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.get).mockResolvedValue({ data: [] })
    await vendeurService.getCommissions('validated')
    expect(apiClient.default.get).toHaveBeenCalledWith(
      '/affiliations/vendeur/commissions/?status=validated'
    )
  })
})

describe('vendeurService.updateCommission', () => {
  beforeEach(() => vi.clearAllMocks())

  it('valide une commission', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.patch).mockResolvedValue({
      data: { detail: 'Commission validée.', status: 'validated' },
    })
    const result = await vendeurService.updateCommission(1, 'validate')
    expect(result.status).toBe('validated')
    expect(apiClient.default.patch).toHaveBeenCalledWith(
      '/affiliations/vendeur/commissions/1/validate/',
      { action: 'validate' }
    )
  })

  it('annule une commission', async () => {
    const apiClient = await import('../lib/api')
    vi.mocked(apiClient.default.patch).mockResolvedValue({
      data: { detail: 'Commission annulée.', status: 'cancelled' },
    })
    const result = await vendeurService.updateCommission(1, 'cancel')
    expect(result.status).toBe('cancelled')
  })
})
