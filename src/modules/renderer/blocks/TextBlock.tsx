'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Renderer - TextBlock
import type { Block } from '@/src/types'

interface Props { block: Block }

export default function TextBlock({ block }: Props) {
  const content = (block.richText as string) || (block.text as string) || ''

  return (
    <div className="block-text w-full max-w-4xl mx-auto py-8 prose prose-slate dark:prose-invert" dangerouslySetInnerHTML={{ __html: content }} />
  )
}
