'use client'

import React, { useState } from 'react'
import type { Block } from '@/src/types'
import { builderLogger } from '@/src/modules/builder/logger'
import RichTextEditor from './RichTextEditor'
import apiClient from '@/src/lib/api'

interface PropertiesPanelProps {
  block: Block | null
  blockIndex: number
  onUpdate: (index: number, updates: Partial<Block>) => void
  product?: { name?: string; description?: string; image_main_url?: string | null; image_secondary_1_url?: string | null; image_secondary_2_url?: string | null }
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ block, blockIndex, onUpdate, product }) => {
  const [activeTab, setActiveTab] = useState('Général')
  const [uploading, setUploading] = useState(false)

  const tabs = ['Général', 'Style', 'Visibility', 'Tracking']

  const handleUpdate = (updates: Partial<Block>) => {
    if (block) {
      onUpdate(blockIndex, updates)
      // Log chaque changement de propriété
      builderLogger.propertyChanged(blockIndex, block.type, updates as Record<string, unknown>)
    }
  }

  const handleFileUpload = async (file: File, field: 'image' | 'video' | 'poster') => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Utilise apiClient (axios) pour bénéficier de l'intercepteur JWT + refresh auto
      const { data: result } = await apiClient.post<{ url: string }>(
        '/products/upload/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      if (!result.url) {
        throw new Error('Pas de URL retournée par le serveur')
      }
      handleUpdate({ [field]: result.url })
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Erreur lors de l'upload: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setUploading(false)
    }
  }

  const renderGeneralTab = () => {
    if (!block) return null

    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            {/* Pré-remplissage depuis le produit */}
            {product && (!block.text || !block.subtitle) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between">
                <p className="text-xs text-blue-700 font-medium">Pré-remplir depuis le produit</p>
                <button
                  type="button"
                  onClick={() => handleUpdate({
                    text: product.name || block.text || '',
                    subtitle: product.description || block.subtitle || '',
                    image: product.image_main_url || block.image || '',
                  })}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Appliquer
                </button>
              </div>
            )}
            <div>
              <label htmlFor="hero-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre principal
              </label>
              <input
                id="hero-title"
                type="text"
                value={(block.text as string) || ''}
                onChange={(e) => handleUpdate({ text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={product?.name || 'Titre accrocheur'}
              />
            </div>
            <div>
              <label htmlFor="hero-subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                Sous-titre
              </label>
              <textarea
                id="hero-subtitle"
                rows={2}
                value={(block.subtitle as string) || ''}
                onChange={(e) => handleUpdate({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={product?.description?.slice(0, 80) || 'Description courte'}
              />
            </div>
            <div>
              <label htmlFor="hero-image" className="block text-sm font-medium text-gray-700 mb-1">
                Image de fond
              </label>
              {/* Aperçu image actuelle */}
              {(block.image || product?.image_main_url) && (
                <div className="mb-2 rounded-lg overflow-hidden border border-gray-200 h-24 bg-gray-100">
                  <img
                    src={(block.image as string) || product?.image_main_url || ''}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input
                id="hero-image"
                type="text"
                value={(block.image as string) || ''}
                onChange={(e) => handleUpdate({ image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                placeholder="https://..."
              />
              {product?.image_main_url && !block.image && (
                <button
                  type="button"
                  onClick={() => handleUpdate({ image: product.image_main_url! })}
                  className="mt-1 text-xs text-blue-600 hover:underline"
                >
                  Utiliser l'image principale du produit
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="hero-bg-color" className="block text-xs font-medium text-gray-700 mb-1">
                  Fond
                </label>
                <input
                  id="hero-bg-color"
                  type="color"
                  value={(block.backgroundColor as string) || '#0f172a'}
                  onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                  className="w-full h-9 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label htmlFor="hero-text-color" className="block text-xs font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  id="hero-text-color"
                  type="color"
                  value={(block.textColor as string) || '#ffffff'}
                  onChange={(e) => handleUpdate({ textColor: e.target.value })}
                  className="w-full h-9 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label htmlFor="hero-subtitle-color" className="block text-xs font-medium text-gray-700 mb-1">
                Couleur du sous-titre
              </label>
              <input
                id="hero-subtitle-color"
                type="color"
                value={(block.subtitleColor as string) || '#d1d5db'}
                onChange={(e) => handleUpdate({ subtitleColor: e.target.value })}
                className="w-full h-9 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>
        )

      case 'buy_button':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="buy-button-label" className="block text-sm font-medium text-gray-700 mb-1">
                Texte du bouton
              </label>
              <input
                id="buy-button-label"
                type="text"
                value={block.label || ''}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Acheter maintenant"
              />
            </div>
            <div>
              <label htmlFor="buy-button-style" className="block text-sm font-medium text-gray-700 mb-1">
                Style du bouton
              </label>
              <select
                id="buy-button-style"
                value={block.style || 'primary'}
                onChange={(e) => handleUpdate({ style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="primary">Primaire</option>
                <option value="secondary">Secondaire</option>
                <option value="outline">Contour</option>
              </select>
            </div>
            <div>
              <label htmlFor="buy-button-icon" className="block text-sm font-medium text-gray-700 mb-1">
                Icône du bouton
              </label>
              <input
                id="buy-button-icon"
                type="text"
                value={block.icon || ''}
                onChange={(e) => handleUpdate({ icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="🛒"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="buy-button-affiliate"
                type="checkbox"
                checked={block.affiliate || false}
                onChange={(e) => handleUpdate({ affiliate: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="buy-button-affiliate" className="text-sm text-gray-700">
                Activer l'affiliation
              </label>
            </div>
          </div>
        )

      case 'features':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="features-items" className="block text-sm font-medium text-gray-700 mb-1">
                Fonctionnalités (une par ligne)
              </label>
              <textarea
                id="features-items"
                value={(block.items as string[])?.join('\n') || ''}
                onChange={(e) => handleUpdate({ items: e.target.value.split('\n').filter(item => item.trim()) })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Fonctionnalité 1&#10;Fonctionnalité 2&#10;Fonctionnalité 3"
              />
            </div>
            <div>
              <label htmlFor="features-layout" className="block text-sm font-medium text-gray-700 mb-1">
                Mise en page
              </label>
              <select
                id="features-layout"
                value={(block.gridLayout as string) || 'grid-cols-3'}
                onChange={(e) => handleUpdate({ gridLayout: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="grid-cols-2">2 colonnes</option>
                <option value="grid-cols-3">3 colonnes</option>
                <option value="grid-cols-4">4 colonnes</option>
              </select>
            </div>
          </div>
        )

      case 'testimonials':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="testimonials-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre de la section
              </label>
              <input
                id="testimonials-title"
                type="text"
                value={block.title || ''}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Témoignages clients"
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Témoignages ({(block.items as any[])?.length || 0})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const currentItems = (block.items as any[]) || []
                    const newItems = [
                      ...currentItems,
                      { author: 'Nouveau client', text: 'Excellent service!', rating: 5 }
                    ]
                    handleUpdate({ items: newItems })
                  }}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  + Ajouter
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {((block.items as any[]) || []).map((testimonial: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-gray-500">Témoignage {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = (block.items as any[]).filter((_: any, i: number) => i !== idx)
                          handleUpdate({ items: newItems })
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <input
                        type="text"
                        value={testimonial.author || ''}
                        onChange={(e) => {
                          const newItems = [...(block.items as any[])]
                          newItems[idx] = { ...newItems[idx], author: e.target.value }
                          handleUpdate({ items: newItems })
                        }}
                        placeholder="Nom de l'auteur"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                      <textarea
                        value={testimonial.text || ''}
                        onChange={(e) => {
                          const newItems = [...(block.items as any[])]
                          newItems[idx] = { ...newItems[idx], text: e.target.value }
                          handleUpdate({ items: newItems })
                        }}
                        placeholder="Contenu du témoignage"
                        rows={3}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Note:</label>
                        <select
                          value={testimonial.rating || 5}
                          onChange={(e) => {
                            const newItems = [...(block.items as any[])]
                            newItems[idx] = { ...newItems[idx], rating: Number(e.target.value) }
                            handleUpdate({ items: newItems })
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value={1}>1 étoile</option>
                          <option value={2}>2 étoiles</option>
                          <option value={3}>3 étoiles</option>
                          <option value={4}>4 étoiles</option>
                          <option value={5}>5 étoiles</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'pricing_table':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="pricing-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre du tableau
              </label>
              <input
                id="pricing-title"
                type="text"
                value={block.title || ''}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nos tarifs"
              />
            </div>
            <div>
              <label htmlFor="pricing-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description du tableau
              </label>
              <input
                id="pricing-description"
                type="text"
                value={(block.description as string) || ''}
                onChange={(e) => handleUpdate({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Choisissez le forfait qui vous convient"
              />
            </div>
            <div>
              <label htmlFor="pricing-items" className="block text-sm font-medium text-gray-700 mb-1">
                Forfaits (un par ligne au format: Nom|Prix€|Description|Fonction1,Fonction2|Surligné(true/false)|BoutonTexte|Lien)
              </label>
              <textarea
                id="pricing-items"
                value={(block.items as any[])?.map((item: any) => {
                  if (typeof item === 'object') {
                    const features = Array.isArray(item.features) ? item.features.join(',') : item.features || ''
                    return `${item.name}|${item.price}|${item.description || ''}|${features}|${item.highlighted ? 'true' : 'false'}|${item.ctaText || 'Choisir'}|${item.ctaLink || '#'}`
                  }
                  return item
                }).join('\n') || ''}
                onChange={(e) => {
                  const tiers = e.target.value.split('\n').filter(line => line.trim()).map(line => {
                    const parts = line.split('|')
                    return {
                      name: parts[0]?.trim() || 'Forfait',
                      price: parts[1]?.trim() || '0€',
                      description: parts[2]?.trim() || '',
                      features: parts[3]?.split(',').map(f => f.trim()) || [],
                      highlighted: parts[4]?.trim() === 'true',
                      ctaText: parts[5]?.trim() || 'Choisir',
                      ctaLink: parts[6]?.trim() || '#',
                    }
                  })
                  handleUpdate({ items: tiers })
                }}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                placeholder="Basic|9€|Pour débuter|Support email|false|Essayer|/try&#10;Pro|29€|Pour les professionnels|Support email,Priorité|true|Commencer|/try-pro&#10;Entreprise|99€|Personnalisé|Support 24/7,API|false|Contacter|/contact"
              />
            </div>
          </div>
        )

      case 'social_proof':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="social-proof-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                id="social-proof-title"
                type="text"
                value={block.title || ''}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rejoignez nos clients satisfaits"
              />
            </div>
          </div>
        )

      case 'countdown':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="countdown-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                id="countdown-title"
                type="text"
                value={block.title || ''}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Offre limitée"
              />
            </div>
            <div>
              <label htmlFor="countdown-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
                <span className="text-xs text-gray-400 ml-1 font-normal">(configurable par le vendeur)</span>
              </label>
              <input
                id="countdown-end-date"
                type="datetime-local"
                value={
                  block.endDate
                    ? new Date(block.endDate as string).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) => {
                  const iso = e.target.value ? new Date(e.target.value).toISOString() : ''
                  const secondsRemaining = iso
                    ? Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000))
                    : 24 * 3600
                  handleUpdate({
                    endDate: iso,
                    data: {
                      deadline_iso: iso,
                      seconds_remaining: secondsRemaining,
                      is_expired: secondsRemaining <= 0,
                    },
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {block.endDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Expire le {new Date(block.endDate as string).toLocaleString('fr-FR')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="countdown-style" className="block text-sm font-medium text-gray-700 mb-1">
                Style
              </label>
              <select
                id="countdown-style"
                value={(block.style as string) || 'default'}
                onChange={(e) => handleUpdate({ style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Standard</option>
                <option value="urgent">Urgent (rouge)</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
        )

      case 'stock_status':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="stock-status-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                id="stock-status-title"
                type="text"
                value={block.title || ''}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Stock limité"
              />
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-4">
            {product?.description && !(block.richText || block.text) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between">
                <p className="text-xs text-blue-700 font-medium">Pré-remplir depuis la description</p>
                <button
                  type="button"
                  onClick={() => handleUpdate({ richText: product.description, text: product.description })}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Appliquer
                </button>
              </div>
            )}
            <div>
              <label htmlFor="text-rich" className="block text-sm font-medium text-gray-700 mb-1">
                Contenu
              </label>
              <RichTextEditor
                value={(block.richText as string) || (block.text as string) || ''}
                onChange={(value) => handleUpdate({ richText: value, text: value })}
              />
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="image-file" className="block text-sm font-medium text-gray-700 mb-1">
                Fichier image
              </label>
              <input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'image')
                }}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {uploading && <p className="text-sm text-blue-600 mt-1">Upload en cours...</p>}
            </div>
            <div>
              <label htmlFor="image-url" className="block text-sm font-medium text-gray-700 mb-1">
                Ou URL de l'image
              </label>
              <input
                id="image-url"
                type="url"
                value={block.image || ''}
                onChange={(e) => handleUpdate({ image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemple.com/image.jpg"
              />
            </div>
            <div>
              <label htmlFor="image-alt" className="block text-sm font-medium text-gray-700 mb-1">
                Texte alternatif (SEO)
              </label>
              <input
                id="image-alt"
                type="text"
                value={block.alt || ''}
                onChange={(e) => handleUpdate({ alt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description de l'image"
              />
            </div>
            <div>
              <label htmlFor="image-caption" className="block text-sm font-medium text-gray-700 mb-1">
                Légende (optionnel)
              </label>
              <input
                id="image-caption"
                type="text"
                value={block.caption || ''}
                onChange={(e) => handleUpdate({ caption: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Légende sous l'image"
              />
            </div>
            <div>
              <label htmlFor="image-style" className="block text-sm font-medium text-gray-700 mb-1">
                Style d'affichage
              </label>
              <select
                id="image-style"
                value={block.style || 'centered'}
                onChange={(e) => handleUpdate({ style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="centered">Centré</option>
                <option value="full-width">Pleine largeur</option>
              </select>
            </div>
          </div>
        )

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="video-file" className="block text-sm font-medium text-gray-700 mb-1">
                Fichier vidéo
              </label>
              <input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'video')
                }}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {uploading && <p className="text-sm text-blue-600 mt-1">Upload en cours...</p>}
              <p className="text-xs text-gray-500 mt-1">Formats: MP4, WebM. Durée max: 1 minute.</p>
            </div>
            <div>
              <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-1">
                Ou URL de la vidéo
              </label>
              <input
                id="video-url"
                type="url"
                value={block.video || ''}
                onChange={(e) => handleUpdate({ video: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemple.com/video.mp4"
              />
            </div>
            <div>
              <label htmlFor="video-poster-file" className="block text-sm font-medium text-gray-700 mb-1">
                Image de prévisualisation
              </label>
              <input
                id="video-poster-file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'poster')
                }}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="video-poster" className="block text-sm font-medium text-gray-700 mb-1">
                Ou URL de l'image de prévisualisation
              </label>
              <input
                id="video-poster"
                type="url"
                value={block.poster || ''}
                onChange={(e) => handleUpdate({ poster: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemple.com/poster.jpg"
              />
            </div>
            <div>
              <label htmlFor="video-caption" className="block text-sm font-medium text-gray-700 mb-1">
                Légende (optionnel)
              </label>
              <input
                id="video-caption"
                type="text"
                value={block.caption || ''}
                onChange={(e) => handleUpdate({ caption: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Légende sous la vidéo"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Options de lecture</label>
              <div className="flex items-center">
                <input
                  id="video-autoplay"
                  type="checkbox"
                  checked={block.autoplay || false}
                  onChange={(e) => handleUpdate({ autoplay: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="video-autoplay" className="ml-2 text-sm text-gray-700">
                  Lecture automatique
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="video-muted"
                  type="checkbox"
                  checked={block.muted !== false}
                  onChange={(e) => handleUpdate({ muted: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="video-muted" className="ml-2 text-sm text-gray-700">
                  Muet par défaut
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="video-loop"
                  type="checkbox"
                  checked={block.loop || false}
                  onChange={(e) => handleUpdate({ loop: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="video-loop" className="ml-2 text-sm text-gray-700">
                  Lecture en boucle
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="video-style" className="block text-sm font-medium text-gray-700 mb-1">
                Style d'affichage
              </label>
              <select
                id="video-style"
                value={block.style || 'centered'}
                onChange={(e) => handleUpdate({ style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="centered">Centré</option>
                <option value="full-width">Pleine largeur</option>
              </select>
            </div>
          </div>
        )

      case 'image_gallery': {
        // Images du produit disponibles pour pré-remplissage
        const productImages = [
          product?.image_main_url,
          product?.image_secondary_1_url,
          product?.image_secondary_2_url,
        ].filter(Boolean) as string[]

        const galleryItems: { url: string; alt: string }[] =
          Array.isArray(block.items) && block.items.length > 0
            ? (block.items as { url: string; alt: string }[])
            : []

        const updateItem = (idx: number, field: 'url' | 'alt', value: string) => {
          const next = [...galleryItems]
          next[idx] = { ...next[idx], [field]: value }
          handleUpdate({ items: next })
        }

        const addItem = (url = '', alt = '') => {
          handleUpdate({ items: [...galleryItems, { url, alt }] })
        }

        const removeItem = (idx: number) => {
          handleUpdate({ items: galleryItems.filter((_, i) => i !== idx) })
        }

        return (
          <div className="space-y-4">
            {/* Pré-remplissage depuis les images du produit */}
            {productImages.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-blue-700">Images du produit disponibles</p>
                <div className="flex gap-2 flex-wrap">
                  {productImages.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt={`Image ${i + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => addItem(url, `Image ${i + 1} — ${product?.name || ''}`)}
                        className="absolute inset-0 bg-blue-600/70 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        + Ajouter
                      </button>
                    </div>
                  ))}
                </div>
                {galleryItems.length === 0 && (
                  <button
                    type="button"
                    onClick={() => handleUpdate({
                      items: productImages.map((url, i) => ({
                        url,
                        alt: `${product?.name || 'Image'} ${i + 1}`,
                      })),
                    })}
                    className="w-full text-xs bg-blue-600 text-white py-1.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Importer toutes les images du produit
                  </button>
                )}
              </div>
            )}

            {/* Mise en page */}
            <div>
              <label htmlFor="gallery-layout" className="block text-sm font-medium text-gray-700 mb-1">
                Mise en page
              </label>
              <select
                id="gallery-layout"
                value={(block.gridLayout as string) || 'grid-cols-3'}
                onChange={(e) => handleUpdate({ gridLayout: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="grid-cols-2">2 colonnes</option>
                <option value="grid-cols-3">3 colonnes</option>
                <option value="grid-cols-4">4 colonnes</option>
              </select>
            </div>

            {/* Liste des images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Images ({galleryItems.length})
                </label>
                <button
                  type="button"
                  onClick={() => addItem()}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors font-medium"
                >
                  + Ajouter une image
                </button>
              </div>

              {galleryItems.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400 text-xs">
                  Aucune image — ajoutez-en une ou importez depuis le produit
                </div>
              ) : (
                <div className="space-y-3">
                  {galleryItems.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Image {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Supprimer
                        </button>
                      </div>

                      {/* Aperçu */}
                      {item.url && (
                        <div className="h-20 rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                          <img src={item.url} alt={item.alt} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* URL */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">URL</label>
                        <input
                          type="url"
                          value={item.url}
                          onChange={(e) => updateItem(idx, 'url', e.target.value)}
                          placeholder="https://exemple.com/image.jpg"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Alt */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">Texte alternatif (SEO)</label>
                        <input
                          type="text"
                          value={item.alt}
                          onChange={(e) => updateItem(idx, 'alt', e.target.value)}
                          placeholder="Description de l'image"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      }

      default:
        return (
          <div className="text-gray-500 text-center py-8">
            Propriétés non disponibles pour ce type de bloc
          </div>
        )
    }
  }

  const renderStyleTab = () => {
    if (!block) return null
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="custom-css" className="block text-sm font-medium text-gray-700 mb-1">
            CSS local (override)
          </label>
          <textarea
            id="custom-css"
            value={(block.cssOverride as string) || ''}
            onChange={(e) => handleUpdate({ cssOverride: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="background-color: #111827; color: #ffffff;"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="style-bg-color" className="block text-sm font-medium text-gray-700 mb-1">
              Couleur d'arrière-plan
            </label>
            <input
              id="style-bg-color"
              type="color"
              value={block.backgroundColor || '#ffffff'}
              onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="style-text-color" className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du texte
            </label>
            <input
              id="style-text-color"
              type="color"
              value={block.textColor || '#111827'}
              onChange={(e) => handleUpdate({ textColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="style-padding" className="block text-sm font-medium text-gray-700 mb-1">
              Padding
            </label>
            <input
              id="style-padding"
              type="range"
              min={0}
              max={80}
              value={(block.padding as number) ?? 24}
              onChange={(e) => handleUpdate({ padding: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-sm text-gray-600">{(block.padding as number) ?? 24}px</div>
          </div>
          <div>
            <label htmlFor="style-margin" className="block text-sm font-medium text-gray-700 mb-1">
              Margin
            </label>
            <input
              id="style-margin"
              type="range"
              min={0}
              max={80}
              value={(block.margin as number) ?? 0}
              onChange={(e) => handleUpdate({ margin: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-sm text-gray-600">{(block.margin as number) ?? 0}px</div>
          </div>
          <div>
            <label htmlFor="style-border-radius" className="block text-sm font-medium text-gray-700 mb-1">
              Border radius
            </label>
            <input
              id="style-border-radius"
              type="range"
              min={0}
              max={80}
              value={(block.borderRadius as number) ?? 16}
              onChange={(e) => handleUpdate({ borderRadius: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-sm text-gray-600">{(block.borderRadius as number) ?? 16}px</div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Effets</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.hoverEffect || false}
              onChange={(e) => handleUpdate({ hoverEffect: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Effet au survol</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.animation !== undefined}
              onChange={(e) => handleUpdate({ animation: e.target.checked ? block.animation || 'fade' : undefined })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Animation</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Masquer</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.hideMobile || false}
              onChange={(e) => handleUpdate({ hideMobile: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Masquer sur mobile</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.hideDesktop || false}
              onChange={(e) => handleUpdate({ hideDesktop: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Masquer sur desktop</span>
          </label>
        </div>
      </div>
    )
  }

  const renderVisibilityTab = () => {
    if (!block) return null
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibilité par stock
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock-min" className="block text-sm text-gray-700 mb-1">Stock min</label>
              <input
                id="stock-min"
                type="number"
                min={0}
                value={block.visibility?.stock_min ?? ''}
                onChange={(e) => handleUpdate({ visibility: { ...block.visibility, stock_min: e.target.value ? Number(e.target.value) : undefined } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="stock-max" className="block text-sm text-gray-700 mb-1">Stock max</label>
              <input
                id="stock-max"
                type="number"
                min={0}
                value={block.visibility?.stock_max ?? ''}
                onChange={(e) => handleUpdate({ visibility: { ...block.visibility, stock_max: e.target.value ? Number(e.target.value) : undefined } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Affichage par device</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={block.visibility?.mobile !== false}
                onChange={(e) => handleUpdate({
                  visibility: { ...block.visibility, mobile: e.target.checked }
                })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Afficher sur mobile</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={block.visibility?.desktop !== false}
                onChange={(e) => handleUpdate({
                  visibility: { ...block.visibility, desktop: e.target.checked }
                })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Afficher sur desktop</span>
            </label>
          </div>
        </div>
      </div>
    )
  }

  const renderTrackingTab = () => {
    if (!block) return null
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="block-tracking" className="block text-sm font-medium text-gray-700 mb-1">
            Code de tracking
          </label>
          <input
            id="block-tracking"
            type="text"
            value={typeof block.tracking === 'object' ? block.tracking.event || '' : ''}
            onChange={(e) => handleUpdate({ tracking: { ...(typeof block.tracking === 'object' ? block.tracking : {}), event: e.target.value } })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="GA4 event name"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Propriétés {block ? `— ${block.type}` : ''}
        </h3>
      </div>

      {!block ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Sélectionnez un bloc pour modifier ses propriétés</p>
        </div>
      ) : (
        <>
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'Général' && renderGeneralTab()}
            {activeTab === 'Style' && renderStyleTab()}
            {activeTab === 'Visibility' && renderVisibilityTab()}
            {activeTab === 'Tracking' && renderTrackingTab()}
          </div>
        </>
      )}
    </div>
  )
}

export default PropertiesPanel