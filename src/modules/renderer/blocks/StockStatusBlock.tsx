// Auteur : Gilles - Projet : AGC Space - Module : Renderer - StockStatusBlock
import type { Block, StockStatusData } from '@/src/types'
import { cn } from '@/src/lib/utils'

interface Props { block: Block }

const LEVEL_STYLES = {
  ok: 'text-green-700 bg-green-50 border-green-200',
  low: 'text-orange-700 bg-orange-50 border-orange-200',
  out: 'text-red-700 bg-red-50 border-red-200',
}

export default function StockStatusBlock({ block }: Props) {
  const data = (block.data as StockStatusData) ?? {
    level: 'ok' as const,
    label: 'En stock',
  }

  return (
    <div className={cn('block-stock-status inline-flex items-center gap-2 px-4 py-2 rounded-theme border text-sm font-medium', LEVEL_STYLES[data.level])}>
      <span>{data.level === 'out' ? '❌' : data.level === 'low' ? '⚠️' : '✅'}</span>
      <span>{data.label}</span>
    </div>
  )
}
