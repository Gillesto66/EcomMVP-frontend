// Auteur : Gilles - Projet : AGC Space - Module : Renderer - VideoEmbedBlock
'use client'
import type { Block } from '@/src/types'
import { memo } from 'react'

interface Props { block: Block }

const VideoEmbedBlock = memo(function VideoEmbedBlock({ block }: Props) {
  const videoUrl = block.video || ''

  if (!videoUrl) {
    return (
      <div className="block-video-embed w-full max-w-2xl mx-auto aspect-video bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Vidéo YouTube/Vimeo</p>
          <p className="text-sm">Insérez une URL vidéo (YouTube ou Vimeo)</p>
        </div>
      </div>
    )
  }

  // Extract YouTube ID from various URL formats
  const getYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  // Extract Vimeo ID
  const getVimeoId = (url: string) => {
    const regex = /vimeo\.com\/(\d+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const youtubeId = getYouTubeId(videoUrl)
  const vimeoId = getVimeoId(videoUrl)

  if (!youtubeId && !vimeoId) {
    return (
      <div className="block-video-embed w-full max-w-2xl mx-auto aspect-video bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-red-300">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Format URL non reconnu</p>
          <p className="text-sm">Utilisez une URL YouTube ou Vimeo valide</p>
        </div>
      </div>
    )
  }

  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}`
    : `https://player.vimeo.com/video/${vimeoId}`

  return (
    <div className="block-video-embed w-full max-w-2xl mx-auto">
      {block.title && <h2 className="text-2xl font-bold mb-4 text-center">{block.title}</h2>}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={embedUrl}
          title={block.title || 'Embedded video'}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          aria-label={block.title || 'Video player'}
        />
      </div>
      {typeof block.description === 'string' && block.description && (
        <p className="mt-4 text-center text-gray-600">{block.description}</p>
      )}
    </div>
  )
})

VideoEmbedBlock.displayName = 'VideoEmbedBlock'

export default VideoEmbedBlock