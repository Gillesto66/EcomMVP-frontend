// Auteur : Gilles - Projet : AGC Space - Module : Renderer - HeroBlock
import type { Block } from '@/src/types'
import { cn } from '@/src/lib/utils'

interface Props { block: Block }

export default function HeroBlock({ block }: Props) {
  const text = (block.text as string) || 'Titre principal accrocheur'
  const subtitle = (block.subtitle as string) || 'Sous-titre descriptif pour convaincre'
  const bgColor = (block.backgroundColor as string) || 'from-secondary to-gray-900'
  const textColor = (block.textColor as string) || '#ffffff'
  const subtitleColor = (block.subtitleColor as string) || '#d1d5db'

  const sectionStyle: Record<string, string> = {}
  
  // Si backgroundColor est une couleur hex/rgb au lieu d'une classe, l'appliquer directement
  if (bgColor.startsWith('#') || bgColor.startsWith('rgb')) {
    sectionStyle.backgroundColor = bgColor
  }

  return (
    <section 
      className={cn(
        'block-hero w-full min-h-[400px] flex items-center justify-center px-8 py-16',
        !bgColor.startsWith('#') && !bgColor.startsWith('rgb') && 'bg-gradient-to-br from-secondary to-gray-900'
      )}
      style={sectionStyle}
    >
      <div className="max-w-3xl text-center space-y-6">
        {block.image && (
          <img src={block.image as string} alt="Hero" className="mx-auto max-h-64 object-contain rounded-theme" />
        )}
        <h1 
          className="text-4xl md:text-5xl font-bold leading-tight"
          style={{ color: textColor }}
        >
          {text}
        </h1>
        <p 
          className="text-xl"
          style={{ color: subtitleColor }}
        >
          {subtitle}
        </p>
      </div>
    </section>
  )
}
