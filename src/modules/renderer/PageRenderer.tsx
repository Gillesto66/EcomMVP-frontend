'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Renderer - PageRenderer
/**
 * Composant central du Smart Builder.
 * Boucle sur les blocs du payload /render/ et injecte le composant correspondant.
 * Agnostique au contenu — ajouter un bloc = ajouter une entrée dans ComponentMap.
 */
import { useEffect, memo, useState, useRef, Suspense } from 'react'
import type { CSSProperties } from 'react'
import type { RenderPayload } from '@/src/types'
import COMPONENT_MAP from './ComponentMap'
import { applyThemeVariables } from '@/src/lib/utils'
import { buildPageBackgroundStyle } from '@/src/modules/builder/utils'

interface Props {
  payload: RenderPayload
  selectedBlockIndex?: number
  onBlockClick?: (index: number) => void
}

function LazyBlock({ children, className, style, blockIndex, onBlockClick }: { children: React.ReactNode; className?: string; style?: CSSProperties; blockIndex?: number; onBlockClick?: (index: number) => void }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '250px' })

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className={className}
      style={style}
      onClick={() => {
        if (blockIndex !== undefined && onBlockClick) {
          onBlockClick(blockIndex)
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && blockIndex !== undefined && onBlockClick) {
          e.preventDefault()
          onBlockClick(blockIndex)
        }
      }}
    >
      {isVisible ? (
        children
      ) : (
        <div className="min-h-[220px] flex items-center justify-center text-gray-400">
          Chargement du bloc...
        </div>
      )}
    </section>
  )
}

export default memo(function PageRenderer({ payload, selectedBlockIndex, onBlockClick }: Props) {
  const { product, theme, blocks, critical_css, page_settings } = payload

  // Applique les variables CSS du thème sur :root
  useEffect(() => {
    if (theme?.variables && Object.keys(theme.variables).length > 0) {
      applyThemeVariables(theme.variables as Record<string, string>)
    }
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const existingOg = document.head.querySelector('meta[property="og:image"]') as HTMLMetaElement | null
    const existingDesc = document.head.querySelector('meta[name="description"]') as HTMLMetaElement | null
    const existingTitle = document.head.querySelector('title')
    const existingJsonLd = document.getElementById('agc-schema-jsonld')

    const firstImage = blocks.find((block) => block.image)?.image as string | undefined
    // SEO : priorité aux page_settings, fallback sur les données produit
    const ogImage = page_settings?.seo_og_image || firstImage || product.image_main_url || ''
    const description = page_settings?.seo_description || product.description || payload.template.name
    const title = page_settings?.seo_title || product.name

    // <title>
    if (existingTitle) {
      existingTitle.textContent = title
    } else {
      const t = document.createElement('title')
      t.textContent = title
      document.head.appendChild(t)
    }

    // og:image
    if (existingOg) {
      existingOg.content = ogImage
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:image')
      meta.content = ogImage
      document.head.appendChild(meta)
    }

    // meta description
    if (existingDesc) {
      existingDesc.content = description
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      meta.content = description
      document.head.appendChild(meta)
    }

    // JSON-LD Schema.org
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: ogImage ? [ogImage] : [],
      description: description,
      sku: product.sku,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: product.price,
        availability: product.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    }

    if (existingJsonLd) {
      existingJsonLd.textContent = JSON.stringify(schema)
    } else {
      const script = document.createElement('script')
      script.id = 'agc-schema-jsonld'
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(schema)
      document.head.appendChild(script)
    }
  }, [blocks, product, payload.template.name, page_settings])

  const bgStyle = buildPageBackgroundStyle(page_settings) as CSSProperties

  return (
    <>
      {/* Critical CSS injecté directement — élimine le FOUC */}
      {critical_css && (
        <style dangerouslySetInnerHTML={{ __html: critical_css }} />
      )}

      <main className="min-h-screen bg-background" style={bgStyle}>
        {blocks.map((block, index) => {
          const Component = COMPONENT_MAP[block.type]
          if (!Component) {
            console.warn(`[AGC Renderer] Type de bloc inconnu : "${block.type}"`)
            return null
          }

          const isSelected = selectedBlockIndex === index
          const wrapperClasses = [
            'w-full',
            isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : '',
            block.hoverEffect ? 'transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-xl' : '',
            block.hideMobile ? 'hidden md:block' : '',
            block.hideDesktop ? 'block md:hidden' : '',
          ].filter(Boolean).join(' ')

          const styleOverrides: CSSProperties = {}
          if (block.backgroundColor) styleOverrides.backgroundColor = block.backgroundColor as string
          if (block.textColor) styleOverrides.color = block.textColor as string
          if (typeof block.padding === 'number') styleOverrides.padding = `${block.padding}px`
          if (typeof block.margin === 'number') styleOverrides.margin = `${block.margin}px`
          if (typeof block.borderRadius === 'number') styleOverrides.borderRadius = `${block.borderRadius}px`

          return (
            <LazyBlock
              key={`${block.type}-${index}`}
              className={wrapperClasses}
              style={styleOverrides}
              blockIndex={index}
              onBlockClick={onBlockClick}
            >
              <Suspense fallback={
                <div className="min-h-[220px] flex items-center justify-center text-gray-400">
                  Chargement du composant...
                </div>
              }>
                <Component block={block} product={product} />
              </Suspense>
            </LazyBlock>
          )
        })}
      </main>
    </>
  )
})