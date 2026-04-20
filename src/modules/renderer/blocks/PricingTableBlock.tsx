// Auteur : Gilles - Projet : AGC Space - Module : Renderer - PricingTableBlock
'use client'
import type { Block } from '@/src/types'
import { memo } from 'react'

interface PricingTier {
  name: string
  price: string
  description?: string
  features: string[]
  highlighted?: boolean
  ctaText?: string
  ctaLink?: string
}

interface Props { block: Block }

const PricingTableBlock = memo(function PricingTableBlock({ block }: Props) {
  // Parse tiers from items: peut être string "name|price|..." ou objet { name, price, ... }
  const tiers: PricingTier[] = (block.items as any[])?.map(item => {
    // Si item est un objet, l'utiliser directement
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      return {
        name: item.name?.trim() || 'Forfait',
        price: item.price?.trim() || '0€',
        description: item.description?.trim() || '',
        features: Array.isArray(item.features) 
          ? item.features.map((f: any) => (typeof f === 'string' ? f : String(f)).trim())
          : (typeof item.features === 'string' ? item.features.split(',').map((f: string) => f.trim()) : []),
        highlighted: item.highlighted === true || item.highlighted === 'true',
        ctaText: item.ctaText?.trim() || 'Choisir',
        ctaLink: item.ctaLink?.trim() || '#',
      }
    }
    
    // Si item est une string, parser le format "name|price|description|feature1,feature2|highlighted|ctaText|ctaLink"
    if (typeof item === 'string') {
      const parts = item.split('|')
      const features = parts[3]?.split(',').map(f => f.trim()) || []
      return {
        name: parts[0]?.trim() || 'Forfait',
        price: parts[1]?.trim() || '0€',
        description: parts[2]?.trim() || '',
        features,
        highlighted: parts[4]?.trim() === 'true',
        ctaText: parts[5]?.trim() || 'Choisir',
        ctaLink: parts[6]?.trim() || '#',
      }
    }
    
    // Fallback
    return {
      name: 'Forfait',
      price: '0€',
      description: '',
      features: [],
      highlighted: false,
      ctaText: 'Choisir',
      ctaLink: '#',
    }
  }) || []

  if (!tiers || tiers.length === 0) {
    return (
      <div className="block-pricing-table w-full max-w-5xl mx-auto p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-500">
          <p className="text-lg font-medium">Tableau de tarification</p>
          <p className="text-sm">Ajoutez des forfaits au format : Nom|Prix|Description|Fonctionnalités|Surligné</p>
        </div>
      </div>
    )
  }

  return (
    <div className="block-pricing-table w-full max-w-6xl mx-auto px-4 py-8">
      {block.title && (
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{block.title}</h2>
          {typeof block.description === 'string' && block.description && (
            <p className="text-gray-600 text-lg">{block.description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className={`rounded-lg overflow-hidden transition-transform hover:scale-105 ${
              tier.highlighted
                ? 'ring-2 ring-blue-500 shadow-2xl'
                : 'shadow-lg'
            }`}
          >
            {/* Header */}
            <div className={`p-6 ${
              tier.highlighted ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}>
              {tier.highlighted && (
                <div className="text-sm font-semibold mb-2">★ POPULAIRE ★</div>
              )}
              <h3 className="text-2xl font-bold">{tier.name}</h3>
              <p className="text-lg font-semibold mt-2">{tier.price}</p>
              {tier.description && (
                <p className={`text-sm mt-1 ${
                  tier.highlighted ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {tier.description}
                </p>
              )}
            </div>

            {/* Features */}
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <a
                href={tier.ctaLink}
                className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                  tier.highlighted
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
                aria-label={`${tier.ctaText} ${tier.name}`}
              >
                {tier.ctaText}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

PricingTableBlock.displayName = 'PricingTableBlock'

export default PricingTableBlock