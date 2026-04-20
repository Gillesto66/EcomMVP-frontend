// Auteur : Gilles - Projet : AGC Space - Module : Tests - AffiliationStore
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAffiliationStore } from '../modules/affiliation/store/affiliationStore'

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    get: vi.fn(() => undefined),
    remove: vi.fn(),
  },
}))

// Mock apiClient
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('AffiliationStore', () => {
  beforeEach(() => {
    useAffiliationStore.setState({ trackingCode: null, isValidated: false })
  })

  it('état initial vide', () => {
    const { trackingCode, isValidated } = useAffiliationStore.getState()
    expect(trackingCode).toBeNull()
    expect(isValidated).toBe(false)
  })

  it('clear remet à zéro', () => {
    useAffiliationStore.setState({ trackingCode: 'ABC123', isValidated: true })
    useAffiliationStore.getState().clear()
    expect(useAffiliationStore.getState().trackingCode).toBeNull()
    expect(useAffiliationStore.getState().isValidated).toBe(false)
  })

  it('initFromCookie lit le cookie existant', async () => {
    const Cookies = await import('js-cookie')
    vi.mocked(Cookies.default.get).mockReturnValue('COOKIE_CODE' as unknown as string)
    useAffiliationStore.getState().initFromCookie()
    expect(useAffiliationStore.getState().trackingCode).toBe('COOKIE_CODE')
  })
})
