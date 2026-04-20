'use client'
export const dynamic = 'force-dynamic'
// Redirection client vers la marketplace — évite le bug clientModules de Next.js 14
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ShopRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/shop') }, [router])
  return null
}
