// Auteur : Gilles - Projet : AGC Space - Module : Utilitaires
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Fusionne les classes Tailwind sans conflits */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Applique les variables CSS du thème sur un élément DOM */
export function applyThemeVariables(variables: Record<string, string>, element: HTMLElement = document.documentElement) {
  Object.entries(variables).forEach(([key, value]) => {
    element.style.setProperty(`--${key.replace(/_/g, '-')}`, value)
  })
}

/** Formate un prix en euros */
export function formatPrice(price: string | number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(price))
}

/** Debounce — évite de saturer l'API lors de l'auto-save du builder */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
