// Auteur : Gilles - Projet : AGC Space - Module : TanStack Query Client
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 min — données fraîches
      retry: 2,                     // 2 tentatives automatiques en cas d'erreur réseau
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
