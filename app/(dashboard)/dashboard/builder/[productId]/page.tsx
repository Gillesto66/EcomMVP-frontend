'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Builder - Page éditeur
// Builder V2 : Layout 50/50 avec preview intégrée (EnhancedBlockEditor)
import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/src/modules/dashboard/pages/productService'
import EnhancedBlockEditor from '@/src/modules/builder/components/EnhancedBlockEditor'
import type { Block, RenderPayload, PageSettings } from '@/src/types'
import { builderLogger } from '@/src/modules/builder/logger'
import { sanitizePageSettings } from '@/src/modules/builder/utils'

export default function BuilderPage({ params }: { params: { productId: string } }) {
  const productId = Number(params.productId)
  const qc = useQueryClient()
  const [previewPayload, setPreviewPayload] = useState<RenderPayload | null>(null)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSavingManual, setIsSavingManual] = useState(false)

  const { data: payload, isLoading } = useQuery({
    queryKey: ['builder', productId],
    queryFn: () => productService.getBuilderPayload(productId),
  })

  // TanStack Query v5 — onSuccess supprimé, on utilise useEffect
  useEffect(() => {
    if (payload) {
      setPreviewPayload(payload)
      builderLogger.debug({
        component: 'BuilderPage',
        action: 'payloadLoaded',
        value: `${payload.blocks.length} blocks`,
      })
    }
  }, [payload])

  const { mutate: saveBlocks } = useMutation({
    mutationFn: async ({ blocks, pageSettings }: { blocks: Block[]; pageSettings?: PageSettings }) => {
      if (!payload) return
      builderLogger.debug({
        component: 'BuilderPage',
        action: 'saveMutation',
        value: `${blocks.length} blocks`,
      })
      const { sanitizeBlocksForAPI } = await import('@/src/modules/builder/utils')
      const cleanedBlocks = sanitizeBlocksForAPI(blocks)
      const cleanedSettings = pageSettings ? sanitizePageSettings(pageSettings) : undefined
      // Sauvegarder blocs + page_settings dans la config du template
      await productService.updateTemplate(payload.template.id, {
        blocks: cleanedBlocks,
        ...(cleanedSettings ? { page_settings: cleanedSettings } : {}),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['builder', productId] })
      setSaveMessage({ type: 'success', text: '✓ Sauvegardé avec succès!' })
      setTimeout(() => setSaveMessage(null), 3000)
      setIsSavingManual(false)
      builderLogger.info({
        component: 'BuilderPage',
        action: 'saveSuccess',
        value: 'cache invalidated',
      })
    },
    onError: (error) => {
      setSaveMessage({ type: 'error', text: `✗ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` })
      setTimeout(() => setSaveMessage(null), 5000)
      setIsSavingManual(false)
      builderLogger.error({
        component: 'BuilderPage',
        action: 'saveFailed',
        error: error instanceof Error ? error.message : String(error),
      })
    },
  })

  const handleBlocksChange = useCallback(
    (blocks: Block[], pageSettings?: PageSettings) => {
      if (previewPayload) {
        setPreviewPayload({ ...previewPayload, blocks, page_settings: pageSettings })
      }
    },
    [previewPayload]
  )

  const handleSave = useCallback(
    async (blocks: Block[], pageSettings?: PageSettings) => {
      if (previewPayload) {
        setPreviewPayload({ ...previewPayload, blocks, page_settings: pageSettings })
      }
      setIsSavingManual(true)
      saveBlocks({ blocks, pageSettings })
    },
    [previewPayload, saveBlocks]
  )

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">Chargement…</div>
    )
  if (!payload)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">Produit introuvable</div>
    )

  return (
    <div className="h-screen overflow-hidden">
      <div className="sticky top-0 bg-gray-800 text-white text-xs px-4 py-2 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
          Builder V2 — {payload.product.name}
        </div>
        {saveMessage && (
          <div className={`px-3 py-1 rounded text-sm font-medium ${
            saveMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {saveMessage.text}
          </div>
        )}
      </div>
      <EnhancedBlockEditor
        key={previewPayload?.blocks.length || 0}
        initialBlocks={previewPayload?.blocks || payload.blocks}
        onSave={handleSave}
        onBlocksChange={handleBlocksChange}
        payload={previewPayload || payload}
        isSavingManual={isSavingManual}
      />
    </div>
  )
}
