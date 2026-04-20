// Auteur : Gilles - Projet : AGC Space - Module : PWA - Enregistrement SW
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
  if (process.env.NODE_ENV !== 'production') return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.info('[SW] Enregistré :', reg.scope))
      .catch((err) => console.warn('[SW] Échec enregistrement :', err))
  })
}
