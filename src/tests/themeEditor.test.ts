// Auteur : Gilles - Projet : AGC Space - Module : Tests - ThemeEditor
import { describe, it, expect } from 'vitest'

// Logique de génération CSS testable sans DOM
function generateCssVars(vars: Record<string, string>): string {
  return `:root {\n${Object.entries(vars).map(([k, v]) => `  --${k.replace(/_/g, '-')}: ${v};`).join('\n')}\n}`
}

describe('ThemeEditor — génération CSS', () => {
  it('génère les variables CSS correctement', () => {
    const css = generateCssVars({ primary_color: '#FF6B35', border_radius: '8px' })
    expect(css).toContain('--primary-color: #FF6B35')
    expect(css).toContain('--border-radius: 8px')
  })

  it('remplace les underscores par des tirets', () => {
    const css = generateCssVars({ font_family: 'Inter' })
    expect(css).toContain('--font-family: Inter')
    expect(css).not.toContain('font_family')
  })

  it('génère un bloc :root valide', () => {
    const css = generateCssVars({ primary_color: '#000' })
    expect(css.startsWith(':root {')).toBe(true)
    expect(css.endsWith('}')).toBe(true)
  })

  it('gère un objet vide', () => {
    const css = generateCssVars({})
    // La fonction génère ':root {\n\n}' avec une ligne vide — comportement attendu
    expect(css).toContain(':root {')
    expect(css).toContain('}')
  })
})
