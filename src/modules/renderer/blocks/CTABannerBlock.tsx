// Auteur : Gilles - Projet : AGC Space - Module : Renderer - CTABannerBlock
'use client'
import type { Block } from '@/src/types'
import { memo } from 'react'

interface Props { block: Block }

const CTABannerBlock = memo(function CTABannerBlock({ block }: Props) {
  const bgImage = block.image || ''
  const bgColor = block.backgroundColor || '#1f2937'
  const textColor = block.backgroundColor === '#ffffff' ? '#1f2937' : '#ffffff'
  const buttonColor = String(block.ctaButtonColor || '#3b82f6')

  const handleCTA = () => {
    if (block.ctaLink && typeof window !== 'undefined') {
      window.location.href = block.ctaLink
    }
  }

  return (
    <div
      className="block-cta-banner relative w-full h-72 overflow-hidden rounded-lg flex items-center justify-center group cursor-pointer"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: !bgImage ? bgColor : undefined,
      }}
      role="complementary"
      aria-label={block.title || 'Call to action banner'}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {block.title && (
          <h2 className="text-4xl font-bold mb-4" style={{ color: textColor }}>
            {block.title}
          </h2>
        )}
        {typeof block.description === 'string' && block.description && (
          <p className="text-lg mb-6" style={{ color: textColor }}>
            {block.description}
          </p>
        )}
        <button
          onClick={handleCTA}
          className="px-8 py-3 rounded-lg font-semibold text-white hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: buttonColor,
          }}
          aria-label={block.ctaText || 'Call to action button'}
        >
          {block.ctaText || 'En savoir plus'}
        </button>
      </div>
    </div>
  )
})

CTABannerBlock.displayName = 'CTABannerBlock'

export default CTABannerBlock