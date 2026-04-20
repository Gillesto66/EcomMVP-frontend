'use client'
// Auteur : Gilles - Projet : AGC Space - Module : UI - Modal
import { useEffect } from 'react'
import { cn } from '@/src/lib/utils'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: Props) {
  // Fermeture avec Escape — accessibilité clavier
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className={cn('relative bg-white rounded-theme shadow-xl w-full flex flex-col', SIZES[size], 'max-h-[90vh]')}>
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 id="modal-title" className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} aria-label="Fermer" className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="px-6 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
