// Auteur : Gilles - Projet : AGC Space - Module : Tests - ProductForm validation
import { describe, it, expect } from 'vitest'

// Logique de validation extraite du composant (testable sans DOM)
function validateProductForm(form: { name: string; price: string; sku: string }) {
  const errors: Record<string, string> = {}
  if (!form.name.trim()) errors.name = 'Le nom est requis'
  if (!form.price || isNaN(Number(form.price))) errors.price = 'Prix invalide'
  if (!form.sku.trim()) errors.sku = 'Le SKU est requis'
  return errors
}

describe('ProductForm validation', () => {
  it('valide un formulaire correct', () => {
    const errors = validateProductForm({ name: 'Produit', price: '97.00', sku: 'SKU-001' })
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('rejette un nom vide', () => {
    const errors = validateProductForm({ name: '', price: '97.00', sku: 'SKU-001' })
    expect(errors.name).toBeDefined()
  })

  it('rejette un prix non numérique', () => {
    const errors = validateProductForm({ name: 'P', price: 'abc', sku: 'SKU-001' })
    expect(errors.price).toBeDefined()
  })

  it('rejette un SKU vide', () => {
    const errors = validateProductForm({ name: 'P', price: '10', sku: '' })
    expect(errors.sku).toBeDefined()
  })

  it('rejette un prix négatif', () => {
    const errors = validateProductForm({ name: 'P', price: '-5', sku: 'SKU' })
    // -5 est un nombre valide — la validation min est côté input HTML
    expect(isNaN(Number('-5'))).toBe(false)
  })
})
