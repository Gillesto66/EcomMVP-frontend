// Auteur : Gilles - Projet : AGC Space - Module : Tests - Renderer
import { describe, it, expect, vi } from 'vitest'

// Mock next/dynamic directement dans ce test
vi.mock('next/dynamic', () => ({
  default: () => null,
}))

describe('ComponentMap', () => {
  it('contient les types de blocs attendus', async () => {
    const { default: COMPONENT_MAP } = await import('../modules/renderer/ComponentMap')
    const expectedTypes = ['hero', 'features', 'testimonials', 'social_proof', 'countdown', 'stock_status', 'buy_button']
    expectedTypes.forEach((type) => {
      expect(COMPONENT_MAP[type]).toBeDefined()
    })
  })

  it('ne contient pas de type inconnu', async () => {
    const { default: COMPONENT_MAP } = await import('../modules/renderer/ComponentMap')
    expect(COMPONENT_MAP['unknown_block']).toBeUndefined()
  })
})
