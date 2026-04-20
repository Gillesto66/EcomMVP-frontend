// Auteur : Gilles - Projet : AGC Space - Module : Renderer - FeaturesBlock
import type { Block } from '@/src/types'

interface Props { block: Block }

export default function FeaturesBlock({ block }: Props) {
  const items = (block.items as string[]) ?? [
    'Fonctionnalité 1 - Description détaillée',
    'Fonctionnalité 2 - Description détaillée',
    'Fonctionnalité 3 - Description détaillée',
  ]

  if (items.length === 0) return null

  return (
    <div className="block-features grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-theme">
          <span className="text-primary text-xl">✓</span>
          <span className="text-gray-700 text-sm font-medium">{item}</span>
        </div>
      ))}
    </div>
  )
}
