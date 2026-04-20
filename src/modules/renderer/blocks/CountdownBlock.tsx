'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Renderer - CountdownBlock
// Supporte endDate configurable par le vendeur (priorité sur duration_hours)
import { useEffect, useState } from 'react'
import type { Block, CountdownData } from '@/src/types'
import { cn } from '@/src/lib/utils'

interface Props { block: Block }

function pad(n: number) { return String(n).padStart(2, '0') }

export default function CountdownBlock({ block }: Props) {
  // Priorité 1 : endDate défini par le vendeur dans le builder
  // Priorité 2 : data.deadline_iso injecté par le backend
  // Priorité 3 : data.seconds_remaining (fallback)
  const resolveInitialSeconds = (): number => {
    if (block.endDate) {
      const diff = Math.floor((new Date(block.endDate as string).getTime() - Date.now()) / 1000)
      return Math.max(0, diff)
    }
    const data = block.data as CountdownData | undefined
    if (data?.deadline_iso) {
      const diff = Math.floor((new Date(data.deadline_iso).getTime() - Date.now()) / 1000)
      return Math.max(0, diff)
    }
    return data?.seconds_remaining ?? 24 * 3600
  }

  const [seconds, setSeconds] = useState(resolveInitialSeconds)
  const isExpired = seconds <= 0

  useEffect(() => {
    const initial = resolveInitialSeconds()
    setSeconds(initial)
    if (initial <= 0) return
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.endDate, (block.data as CountdownData | undefined)?.deadline_iso])

  if (isExpired) return null

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const style = (block.style as string) || 'default'
  const isUrgent = style === 'urgent'

  return (
    <div className={cn('block-countdown text-center py-6', isUrgent && 'bg-red-50')}>
      <p className={cn(
        'text-sm font-medium mb-2 uppercase tracking-wide',
        isUrgent ? 'text-red-600' : 'text-gray-500'
      )}>
        {(block.title as string) || 'Offre limitée'} — se termine dans
      </p>
      <div className="flex justify-center gap-4">
        {[{ v: h, l: 'h' }, { v: m, l: 'min' }, { v: s, l: 'sec' }].map(({ v, l }) => (
          <div key={l} className="flex flex-col items-center">
            <span className={cn(
              'text-4xl font-bold tabular-nums',
              isUrgent ? 'text-red-600' : 'text-primary'
            )}>
              {pad(v)}
            </span>
            <span className="text-xs text-gray-400 mt-1">{l}</span>
          </div>
        ))}
      </div>
      {block.endDate && (
        <p className="text-xs text-gray-400 mt-2">
          Jusqu'au {new Date(block.endDate as string).toLocaleString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      )}
    </div>
  )
}
