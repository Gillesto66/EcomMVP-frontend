// Auteur : Gilles - Projet : AGC Space - Module : Renderer - TestimonialsCarouselBlock
'use client'
import type { Block } from '@/src/types'
import { useState, memo, useCallback } from 'react'

interface Testimonial {
  author: string
  text: string
  role?: string
  avatar?: string
}

interface Props { block: Block }

const TestimonialsCarouselBlock = memo(function TestimonialsCarouselBlock({ block }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Parse testimonials: "author|role|text" format
  const testimonials: Testimonial[] = (block.items as string[])?.map(item => {
    const parts = item.split('|')
    return {
      author: parts[0]?.trim() || 'Auteur inconnu',
      role: parts[1]?.trim() || '',
      text: parts[2]?.trim() || '',
      avatar: parts[3]?.trim() || '',
    }
  }) || []

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="block-testimonials-carousel w-full max-w-3xl mx-auto p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-500">
          <p className="text-lg font-medium">Témoignages</p>
          <p className="text-sm">Ajoutez des témoignages au format : Auteur|Rôle|Témoignage</p>
        </div>
      </div>
    )
  }

  const current = testimonials[currentIndex] || testimonials[0]

  return (
    <div
      className="block-testimonials-carousel w-full max-w-3xl mx-auto px-4 py-8"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') goPrev()
        if (event.key === 'ArrowRight') goNext()
      }}
      aria-label="Carrousel de témoignages"
    >
      {block.title && (
        <h2 className="text-3xl font-bold mb-12 text-center">{block.title}</h2>
      )}

      <div className="relative">
        {/* Testimonial Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Star Rating */}
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-2xl">★</span>
            ))}
          </div>

          {/* Text */}
          <p className="text-gray-700 text-center italic text-lg mb-6">
            "{current.text}"
          </p>

          {/* Author Info */}
          <div className="flex items-center justify-center">
            {current.avatar && (
              <img
                src={current.avatar}
                alt={current.author}
                className="w-12 h-12 rounded-full mr-4 object-cover"
                loading="lazy"
              />
            )}
            <div className="text-center">
              <p className="font-bold text-gray-900">{current.author}</p>
              {current.role && (
                <p className="text-gray-600 text-sm">{current.role}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={goPrev}
            className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Témoignage précédent"
          >
            ←
          </button>

          {/* Indicators */}
          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-blue-500 w-4' : 'bg-gray-300'
                }`}
                aria-label={`Aller au témoignage ${idx + 1}`}
                aria-current={idx === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Témoignage suivant"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
})

TestimonialsCarouselBlock.displayName = 'TestimonialsCarouselBlock'

export default TestimonialsCarouselBlock