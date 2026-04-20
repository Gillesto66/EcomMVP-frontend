'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Renderer - SocialProofBlock
import type { Block, SocialProofData } from '@/src/types'

interface Props { block: Block }

export default function SocialProofBlock({ block }: Props) {
  const data = (block.data as SocialProofData) ?? {
    total_sold: 42,
    period_days: 7,
    buyer_count: 15,
  }

  return (
    <div className="block-social-proof bg-amber-50 border-l-4 border-primary px-6 py-4 rounded-r-theme">
      <p className="text-sm font-medium text-amber-800">
        🔥 <strong>{data.total_sold}</strong> vente{data.total_sold > 1 ? 's' : ''} ces {data.period_days} derniers jours
        {data.buyer_count > 0 && (
          <span className="ml-1">par <strong>{data.buyer_count}</strong> acheteur{data.buyer_count > 1 ? 's' : ''}</span>
        )}
      </p>
    </div>
  )
}
