// Auteur : Gilles - Projet : AGC Space - Module : Renderer - VideoBlock
import type { Block } from '@/src/types'
import { cn } from '@/src/lib/utils'
import { useState } from 'react'

interface Props { block: Block }

export default function VideoBlock({ block }: Props) {
  const videoUrl = block.video as string
  const poster = block.poster as string
  const autoplay = block.autoplay as boolean
  const muted = block.muted !== false // default to true for autoplay
  const loop = block.loop as boolean
  const caption = block.caption as string

  const [isLoaded, setIsLoaded] = useState(false)

  if (!videoUrl) {
    return (
      <div className="block-video w-full p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">Bloc Vidéo</p>
          <p className="text-sm">Ajoutez une vidéo (max 1 minute) pour commencer</p>
        </div>
      </div>
    )
  }

  return (
    <div className="block-video w-full">
      <figure className="max-w-full">
        <div className="relative rounded-lg overflow-hidden shadow-lg bg-black">
          <video
            src={videoUrl}
            poster={poster}
            autoPlay={autoplay}
            muted={muted}
            loop={loop}
            controls={!autoplay}
            className={cn(
              'w-full h-auto',
              block.style === 'full-width' && 'w-full',
              block.style === 'centered' && 'max-w-2xl mx-auto'
            )}
            onLoadedData={() => setIsLoaded(true)}
            onError={() => setIsLoaded(false)}
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 mb-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Chargement de la vidéo...</p>
              </div>
            </div>
          )}
        </div>

        {caption && (
          <figcaption className="mt-2 text-center text-sm text-gray-600 italic">
            {caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}