'use client'
// Auteur : Gilles - Projet : AGC Space
// Wrapper client pour les composants qui utilisent window/browser APIs
// Isolé du layout Server Component pour éviter le bug clientModules de Next.js 14
import CartDrawer from '@/src/modules/cart/components/CartDrawer'
import ToastContainer from '@/src/components/ui/Toast'

export default function ClientShell() {
  return (
    <>
      <CartDrawer />
      <ToastContainer />
    </>
  )
}
