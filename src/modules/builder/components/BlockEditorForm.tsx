'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Builder - BlockEditorForm
// Formulaire d'édition inline pour un bloc sélectionné
import { useState, useCallback } from 'react'
import type { Block } from '@/src/types'
import { builderLogger } from '@/src/modules/builder/logger'

interface Props {
  block: Block
  blockIndex: number
  onUpdate: (index: number, updates: Partial<Block>) => void
  onClose: () => void
}

export default function BlockEditorForm({ block, blockIndex, onUpdate, onClose }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({
    text: (block as any)?.text || '',
    subtitle: (block as any)?.subtitle || '',
    image: (block as any)?.image || '',
    label: (block as any)?.label || '',
  })

  const handleChange = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      const updates: Partial<Block> = {}
      Object.entries(formData).forEach(([key, value]) => {
        if (value && value !== '') {
          ;(updates as any)[key] = value
        }
      })

      onUpdate(blockIndex, updates)

      builderLogger.info({
        component: 'BlockEditorForm',
        action: 'submitted',
        blockIndex,
        value: Object.keys(updates).length,
      })

      onClose()
    },
    [formData, blockIndex, onUpdate, onClose]
  )

  const handleCancel = useCallback(() => {
    builderLogger.debug({
      component: 'BlockEditorForm',
      action: 'cancelled',
      blockIndex,
    })
    onClose()
  }, [blockIndex, onClose])

  const renderFormFields = () => {
    const getBlockLabel = (type: string): string => {
      const labels: Record<string, string> = {
        hero: 'Bannière Hero',
        features: 'Fonctionnalités',
        testimonials: 'Témoignages',
        social_proof: 'Preuve sociale',
        countdown: 'Compte à rebours',
        stock_status: 'Stock',
        buy_button: "Bouton d'achat",
        text: 'Texte',
      }
      return labels[type] || type
    }

    switch (block.type) {
      case 'hero':
        return (
          <>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre principal</label>
              <input
                type="text"
                value={formData.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Entrez le titre"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="Sous-titre optionnel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Image</label>
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => handleChange('image', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
          </>
        )

      case 'buy_button':
        return (
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Texte du bouton</label>
            <input
              type="text"
              value={formData.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="ex: Acheter maintenant"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        )

      case 'text':
        return (
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu texte</label>
            <textarea
              value={formData.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Votre texte ici..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        )

      default:
        return (
          <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
            <p>Édition basique pour ce type de bloc — Vous pouvez ajouter d'autres propriétés en Phase F10.2</p>
          </div>
        )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-2">{block.type.toUpperCase()}</h2>
        <p className="text-sm text-gray-500 mb-4">Bloc #{blockIndex}</p>

        <div className="space-y-4 mb-6">{renderFormFields()}</div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}
