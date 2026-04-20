// Auteur : Gilles - Projet : AGC Space - Module : Tests - Setup
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/dynamic — non disponible dans l'environnement Vitest (jsdom)
vi.mock('next/dynamic', () => ({
  default: (fn: () => Promise<{ default: unknown }>) => {
    // Retourne un composant synchrone pour les tests
    let Component: unknown = null
    fn().then((mod) => { Component = mod.default })
    return Component
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
