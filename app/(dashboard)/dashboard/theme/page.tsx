'use client'
export const dynamic = 'force-dynamic'
// Auteur : Gilles - Projet : AGC Space - Module : Dashboard - Page Thème
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/src/modules/dashboard/pages/productService'
import ThemeEditor from '@/src/modules/dashboard/components/ThemeEditor'
import { Skeleton } from '@/src/components/ui/Skeleton'

export default function ThemePage() {
  const { data: theme, isLoading } = useQuery({
    queryKey: ['theme'],
    queryFn: productService.getTheme,
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design System</h1>
          <p className="text-sm text-gray-500 mt-1">
            Personnalisez les couleurs et polices de vos pages de vente. Les changements s&apos;appliquent en temps réel.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : theme ? (
          <ThemeEditor theme={theme} />
        ) : (
          <p className="text-red-500 text-sm">Impossible de charger le thème.</p>
        )}
      </div>
    </div>
  )
}
