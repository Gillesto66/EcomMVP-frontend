// Auteur : Gilles - Projet : AGC Space - Module : Renderer - ImageGalleryBlock
'use client'
import type { Block } from '@/src/types'
import { cn } from '@/src/lib/utils'
import { useState, memo } from 'react'

interface Props { block: Block }

const ImageGalleryBlock = memo(function ImageGalleryBlock({ block }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const images = (block.items as string[]) || []

  if (!images || images.length === 0) {
    return (
      <div className="block-image-gallery w-full p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">Galerie d'images</p>
          <p className="text-sm">Ajoutez des images pour créer un carrousel</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="block-image-gallery w-full"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          setSelectedIndex((i) => (i - 1 + images.length) % images.length)
        }
        if (event.key === 'ArrowRight') {
          setSelectedIndex((i) => (i + 1) % images.length)
        }
      }}
      aria-label="Carrousel d'images"
    >
      <div className={cn(
        'rounded-lg overflow-hidden shadow-lg',
        block.style === 'full-width' ? 'w-full' : 'max-w-4xl mx-auto'
      )}>
        {/* Main image */}
        <div className="relative bg-black">
          <img
            src={images[selectedIndex]}
            alt={`Image ${selectedIndex + 1}`}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedIndex((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
                aria-label="Image précédente"
              >
                ←
              </button>
              <button
                onClick={() => setSelectedIndex((i) => (i + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
                aria-label="Image suivante"
              >
                →
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 p-4 bg-gray-100 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  'flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all',
                  selectedIndex === idx ? 'border-blue-500' : 'border-gray-300'
                )}
                aria-label={`Image ${idx + 1}`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

ImageGalleryBlock.displayName = 'ImageGalleryBlock'

export default ImageGalleryBlock