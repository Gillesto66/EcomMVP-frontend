// Auteur : Gilles - Projet : AGC Space - Module : Renderer - ImageBlock
import type { Block } from '@/src/types'
import { cn } from '@/src/lib/utils'

interface Props { block: Block }

export default function ImageBlock({ block }: Props) {
  const imageUrl = block.image as string
  const alt = (block.alt as string) || 'Image'
  const caption = block.caption as string

  if (!imageUrl) {
    return (
      <div className="block-image w-full p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">Bloc Image</p>
          <p className="text-sm">Ajoutez une image pour commencer</p>
        </div>
      </div>
    )
  }

  return (
    <div className="block-image w-full">
      <figure className="max-w-full">
        <img
          src={imageUrl}
          alt={alt}
          className={cn(
            'w-full h-auto rounded-lg shadow-lg',
            block.style === 'full-width' && 'w-full',
            block.style === 'centered' && 'max-w-2xl mx-auto'
          )}
        />
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-gray-600 italic">
            {caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}