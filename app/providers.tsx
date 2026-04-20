'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Providers globaux
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'
import { queryClient } from '@/src/lib/queryClient'
import { registerServiceWorker } from '@/src/lib/registerSW'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => { registerServiceWorker() }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
