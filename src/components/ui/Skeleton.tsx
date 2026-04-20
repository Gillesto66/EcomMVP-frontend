// Auteur : Gilles - Projet : AGC Space - Module : UI - Skeleton
// Évite le layout shift pendant le chargement (Lighthouse CLS)
import { cn } from '@/src/lib/utils'

interface Props { className?: string; lines?: number }

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded-theme', className)} />
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-theme border border-gray-100 p-5 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
