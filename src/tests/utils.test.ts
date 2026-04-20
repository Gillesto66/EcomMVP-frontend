// Auteur : Gilles - Projet : AGC Space - Module : Tests - Utils
import { describe, it, expect, vi } from 'vitest'
import { cn, formatPrice, debounce } from '../lib/utils'

describe('cn (classnames)', () => {
  it('fusionne des classes simples', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
  it('résout les conflits Tailwind', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
  it('ignore les valeurs falsy', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c')
  })
})

describe('formatPrice', () => {
  it('formate un prix en euros', () => {
    expect(formatPrice('97.00')).toContain('97')
    expect(formatPrice('97.00')).toContain('€')
  })
  it('accepte un nombre', () => {
    expect(formatPrice(29.99)).toContain('29')
  })
})

describe('debounce', () => {
  it('ne déclenche la fonction qu\'une fois après le délai', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 300)
    debounced()
    debounced()
    debounced()
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
