'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Builder - EnhancedBlockEditor V2
// Éditeur visual WYSIWYG avec preview intégrée, édition inline, logs complets
import { useState, useCallback, useRef, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import type { Block, BlockType, RenderPayload } from '@/src/types'
import { debounce } from '@/src/lib/utils'
import PageRenderer from '@/src/modules/renderer/PageRenderer'
import { builderLogger } from '@/src/modules/builder/logger'
import { normalizeBlocks, validateBlock, createEmptyBlock, hasBlocksChanged, getBlocksHash, deepCloneBlock, BuilderTemplate, BUILDER_TEMPLATES } from '@/src/modules/builder/utils'
import BlockEditorForm from './BlockEditorForm'
import PropertiesPanel from './PropertiesPanel'
import PageSettingsPanel from './PageSettingsPanel'
import { createDefaultPageSettings, sanitizePageSettings } from '@/src/modules/builder/utils'
import type { PageSettings } from '@/src/types'

const AVAILABLE_BLOCKS: { type: BlockType; label: string; icon: string }[] = [
  { type: 'hero', label: 'Bannière Hero', icon: '🖼️' },
  { type: 'features', label: 'Fonctionnalités', icon: '✅' },
  { type: 'testimonials', label: 'Témoignages', icon: '💬' },
  { type: 'social_proof', label: 'Preuve sociale', icon: '🔥' },
  { type: 'countdown', label: 'Compte à rebours', icon: '⏱️' },
  { type: 'stock_status', label: 'Stock', icon: '📦' },
  { type: 'buy_button', label: 'Bouton d\'achat', icon: '🛒' },
  { type: 'text', label: 'Texte', icon: '📝' },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'video', label: 'Vidéo', icon: '🎥' },
  { type: 'image_gallery', label: 'Galerie d\'images', icon: '🖼️' },
  { type: 'video_embed', label: 'Vidéo YouTube/Vimeo', icon: '🎬' },
  { type: 'faq_accordion', label: 'FAQ / Accordéon', icon: '❓' },
  { type: 'cta_banner', label: 'Bannière CTA', icon: '📢' },
  { type: 'testimonials_carousel', label: 'Carrousel Témoignages', icon: '⭐' },
  { type: 'pricing_table', label: 'Tableau de tarification', icon: '💰' },
  { type: 'contact_form', label: 'Formulaire de contact', icon: '📧' },
]

interface SortableBlockProps {
  block: Block
  index: number
  isSelected: boolean
  onRemove: (index: number) => void
  onSelect: (index: number) => void
}

function SortableBlock({ block, index, isSelected, onRemove, onSelect }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `block-${index}` })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  const meta = AVAILABLE_BLOCKS.find((b) => b.type === block.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(index)}
      className={`flex items-center gap-3 bg-white border-2 rounded-theme px-4 py-3 shadow-sm cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600 text-lg"
        title="Glisser pour réordonner"
      >
        ⠿
      </button>
      <span className="text-xl">{meta?.icon ?? '📄'}</span>
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-700">{meta?.label ?? block.type}</span>
        <span className="text-xs text-gray-400 ml-2">Bloc #{index}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove(index)
        }}
        className="text-red-400 hover:text-red-600 text-sm px-2"
        title="Supprimer ce bloc"
      >
        ✕
      </button>
    </div>
  )
}

interface Props {
  initialBlocks: Block[]
  onSave: (blocks: Block[], pageSettings?: PageSettings) => Promise<void>
  payload: RenderPayload
  onBlocksChange?: (blocks: Block[], pageSettings?: PageSettings) => void
  isSavingManual?: boolean
}

export default function EnhancedBlockEditor({ initialBlocks, onSave, payload, onBlocksChange, isSavingManual }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(normalizeBlocks(initialBlocks))
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null)
  const [blocksHash, setBlocksHash] = useState(getBlocksHash(initialBlocks))
  const [undoStack, setUndoStack] = useState<Block[][]>([])
  const [redoStack, setRedoStack] = useState<Block[][]>([])
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [pageSettings, setPageSettings] = useState<PageSettings>(
    payload.page_settings ?? createDefaultPageSettings()
  )
  const [showPageSettings, setShowPageSettings] = useState(false)
  // ── État collapse des 3 panneaux ─────────────────────────────────────────
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [middleCollapsed, setMiddleCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Auto-save debounced — 800ms après la dernière modification
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (newBlocks: Block[], settings: PageSettings) => {
      builderLogger.autoSaveStart()
      const start = performance.now()
      try {
        await onSave(newBlocks, settings)
        builderLogger.autoSaveEnd(Math.round(performance.now() - start), true)
      } catch (err) {
        builderLogger.autoSaveEnd(Math.round(performance.now() - start), false)
        builderLogger.error({
          component: 'EnhancedBlockEditor',
          action: 'autoSaveFailed',
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }, 800),
    [onSave]
  )

  const pushHistory = useCallback((currentBlocks: Block[]) => {
    setUndoStack((prev) => [...prev, currentBlocks.map(deepCloneBlock)])
    setRedoStack([])
  }, [])

  const updateBlocks = useCallback(
    (newBlocks: Block[], saveHistory = true) => {
      if (!hasBlocksChanged(blocks, newBlocks)) {
        builderLogger.debug({
          component: 'EnhancedBlockEditor',
          action: 'blocksUnchanged',
        })
        return
      }

      if (saveHistory) {
        pushHistory(blocks)
      }

      setBlocks(newBlocks)
      setActiveTemplateId(null)
      const hash = getBlocksHash(newBlocks)
      setBlocksHash(hash)
      setHasChanges(true)

      // Update preview immediately
      onBlocksChange?.(newBlocks, pageSettings)

      const syncStart = performance.now()
      requestAnimationFrame(() => {
        const syncDuration = Math.round(performance.now() - syncStart)
        builderLogger.info({
          component: 'Preview',
          action: 'syncCompleted',
          duration: syncDuration,
          value: `${newBlocks.length} blocks`,
        })
        if (syncDuration > 100) {
          builderLogger.performanceWarning('PreviewSync', syncDuration)
        }
      })

      // Auto-save debounced — 800ms après la dernière modification
      debouncedSave(newBlocks, pageSettings)
    },
    [blocks, onBlocksChange, pushHistory]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      builderLogger.debug({
        component: 'EnhancedBlockEditor',
        action: 'dragEnded_noMove',
      })
      return
    }

    const oldIndex = blocks.findIndex((_, i) => `block-${i}` === active.id)
    const newIndex = blocks.findIndex((_, i) => `block-${i}` === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      builderLogger.warn({
        component: 'EnhancedBlockEditor',
        action: 'dragEnded_invalidIndex',
        value: { oldIndex, newIndex },
      })
      return
    }

    const movedBlocks = arrayMove(blocks, oldIndex, newIndex)
    builderLogger.blockMoved(oldIndex, newIndex)
    updateBlocks(movedBlocks)
    setSelectedBlockIndex(newIndex)
  }

  const addBlock = useCallback(
    (type: BlockType) => {
      const newBlock = createEmptyBlock(type)
      const validation = validateBlock(newBlock)

      if (!validation.valid) {
        builderLogger.warn({
          component: 'EnhancedBlockEditor',
          action: 'blockAddFailed',
          blockType: type,
          value: validation.errors,
        })
        return
      }

      const newBlocks = [...blocks, newBlock]
      builderLogger.blockAdded(blocks.length, type)
      updateBlocks(newBlocks)
      setSelectedBlockIndex(blocks.length)
    },
    [blocks, updateBlocks]
  )

  const removeBlock = useCallback(
    (index: number) => {
      const newBlocks = blocks.filter((_, i) => i !== index)
      builderLogger.blockRemoved(index)
      updateBlocks(newBlocks)

      if (selectedBlockIndex === index) {
        setSelectedBlockIndex(null)
      } else if (selectedBlockIndex !== null && selectedBlockIndex > index) {
        setSelectedBlockIndex(selectedBlockIndex - 1)
      }
    },
    [blocks, selectedBlockIndex, updateBlocks]
  )

  const updateBlock = useCallback(
    (index: number, updates: Partial<Block>) => {
      if (index < 0 || index >= blocks.length) {
        console.error(`Invalid block index: ${index}, blocks length: ${blocks.length}`)
        return
      }

      const newBlocks = [...blocks]
      newBlocks[index] = { ...newBlocks[index], ...updates }
      builderLogger.propertyChanged(index, blocks[index].type, updates as Record<string, unknown>)

      updateBlocks(newBlocks)
    },
    [blocks, updateBlocks]
  )

  const duplicateBlock = useCallback(
    (index: number) => {
      const blockToDuplicate = blocks[index]
      const duplicatedBlock = { ...blockToDuplicate, id: `${blockToDuplicate.type}_${Date.now()}` }
      const newBlocks = [...blocks.slice(0, index + 1), duplicatedBlock, ...blocks.slice(index + 1)]
      builderLogger.info({
        component: 'EnhancedBlockEditor',
        action: 'blockDuplicated',
        blockIndex: index,
        blockType: blockToDuplicate.type,
      })
      updateBlocks(newBlocks)
      setSelectedBlockIndex(index + 1)
    },
    [blocks, updateBlocks]
  )

  const moveBlockUp = useCallback(
    (index: number) => {
      if (index === 0) return
      const newBlocks = arrayMove(blocks, index, index - 1)
      builderLogger.blockMoved(index, index - 1)
      updateBlocks(newBlocks)
      setSelectedBlockIndex(index - 1)
    },
    [blocks, updateBlocks]
  )

  const moveBlockDown = useCallback(
    (index: number) => {
      if (index === blocks.length - 1) return
      const newBlocks = arrayMove(blocks, index, index + 1)
      builderLogger.blockMoved(index, index + 1)
      updateBlocks(newBlocks)
      setSelectedBlockIndex(index + 1)
    },
    [blocks, updateBlocks]
  )

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return

    const previousBlocks = undoStack[undoStack.length - 1]
    setUndoStack((prev) => prev.slice(0, -1))
    setRedoStack((prev) => [...prev, blocks.map(deepCloneBlock)])
    setBlocks(previousBlocks)
    setSelectedBlockIndex(null)
    setBlocksHash(getBlocksHash(previousBlocks))
    setHasChanges(true)
    onBlocksChange?.(previousBlocks)
    builderLogger.info({
      component: 'EnhancedBlockEditor',
      action: 'undo',
      value: `${previousBlocks.length} blocks`,
    })
  }, [blocks, onBlocksChange, undoStack])

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return

    const nextBlocks = redoStack[redoStack.length - 1]
    setRedoStack((prev) => prev.slice(0, -1))
    setUndoStack((prev) => [...prev, blocks.map(deepCloneBlock)])
    setBlocks(nextBlocks)
    setSelectedBlockIndex(null)
    setBlocksHash(getBlocksHash(nextBlocks))
    setHasChanges(true)
    onBlocksChange?.(nextBlocks)
    builderLogger.info({
      component: 'EnhancedBlockEditor',
      action: 'redo',
      value: `${nextBlocks.length} blocks`,
    })
  }, [blocks, onBlocksChange, redoStack])

  const applyTemplate = useCallback(
    (template: BuilderTemplate) => {
      builderLogger.info({
        component: 'EnhancedBlockEditor',
        action: 'templateApplied',
        value: template.id,
      })
      updateBlocks(template.blocks)
      setSelectedBlockIndex(null)
      setActiveTemplateId(template.id)
    },
    [updateBlocks]
  )

  const handlePageSettingsChange = useCallback(
    (settings: PageSettings) => {
      setPageSettings(settings)
      setHasChanges(true)
      onBlocksChange?.(blocks, settings)
      // Auto-save debounced sur les page_settings aussi
      debouncedSave(blocks, settings)
      builderLogger.info({
        component: 'EnhancedBlockEditor',
        action: 'pageSettingsChanged',
        value: Object.keys(settings),
      })
    },
    [blocks, debouncedSave, onBlocksChange]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key?.toLowerCase() || ''
      const isUndo = (event.ctrlKey || event.metaKey) && key === 'z' && !event.shiftKey
      const isRedo = (event.ctrlKey || event.metaKey) && ((event.shiftKey && key === 'z') || key === 'y')

      if (isUndo) {
        event.preventDefault()
        handleUndo()
      }
      if (isRedo) {
        event.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo])

  useEffect(() => {
    builderLogger.info({
      component: 'EnhancedBlockEditor',
      action: 'initialized',
      value: `${blocks.length} blocks, hash: ${blocksHash}`,
    })
  }, [])

  const selectedBlock = selectedBlockIndex !== null ? blocks[selectedBlockIndex] : null

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Builder V2 — {payload.product?.name || 'Produit'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Éditeur visuel WYSIWYG avec aperçu temps réel
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="px-3 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              ↶ Undo
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="px-3 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              ↷ Redo
            </button>
            <button
              type="button"
              onClick={() => {
                if (hasChanges && confirm('Sauvegarder les changements?')) {
                  onSave(blocks, sanitizePageSettings(pageSettings))
                  setHasChanges(false)
                }
              }}
              disabled={!hasChanges || isSavingManual}
              className={`px-4 py-2 rounded text-white font-medium text-sm transition-colors ${
                hasChanges 
                  ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer' 
                  : 'bg-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              {isSavingManual ? '⏳ Sauvegarde...' : hasChanges ? '💾 Sauvegarder' : '✓ À jour'}
            </button>
            <button
              type="button"
              onClick={() => { setShowPageSettings((v) => !v); setSelectedBlockIndex(null) }}
              className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                showPageSettings
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
              title="Paramètres de la page (background, SEO)"
            >
              ⚙️ Page
            </button>
            <Link
              href="/shop"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
            >
              🏪 Marketplace
            </Link>
            <Link
              href={`/shop/${payload.product?.id}`}
              target="_blank"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              👁️ Voir le rendu
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-2 p-3 overflow-hidden">

        {/* ── Panneau Gauche : Éditeur ──────────────────────────────────── */}
        <div className={`flex flex-col overflow-hidden bg-white rounded-lg shadow transition-all duration-200 ${
          leftCollapsed ? 'w-10 min-w-[2.5rem]' : 'flex-1'
        }`}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg shrink-0">
            {!leftCollapsed && (
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Éditeur</span>
            )}
            <button
              type="button"
              onClick={() => setLeftCollapsed((v) => !v)}
              className="ml-auto p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
              title={leftCollapsed ? 'Agrandir le panneau' : 'Réduire le panneau'}
            >
              {leftCollapsed ? '▶' : '◀'}
            </button>
          </div>

          {!leftCollapsed && (
            <div className="flex flex-col flex-1 overflow-hidden p-3 gap-3">
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5">

                {/* Templates prédéfinis */}
                <div className="border border-gray-200 rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">Templates prédéfinis</h3>
                      <p className="text-xs text-gray-500">{BUILDER_TEMPLATES.length} modèles prêts à l'emploi</p>
                    </div>
                    {activeTemplateId && <span className="text-xs text-blue-600 font-medium">✓ Actif</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {BUILDER_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyTemplate(template)}
                        className={`text-left p-2.5 border rounded transition-colors ${
                          activeTemplateId === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-800 leading-tight">{template.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Palette de blocs */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Ajouter un bloc</h3>
                  <div className="grid grid-cols-4 gap-1.5 p-2 bg-gray-100 rounded">
                    {AVAILABLE_BLOCKS.map((block) => (
                      <button
                        key={block.type}
                        onClick={() => addBlock(block.type)}
                        className="flex flex-col items-center gap-0.5 p-1.5 bg-white border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                        title={block.label}
                      >
                        <span className="text-lg leading-none">{block.icon}</span>
                        <span className="text-[10px] font-medium text-gray-600 leading-tight">{block.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Liste des blocs */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Blocs ({blocks.length})
                    {isSavingManual && <span className="text-[10px] text-orange-500 ml-2 normal-case">Saving…</span>}
                  </h3>
                  {blocks.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-lg">
                      Aucun bloc — ajoutez-en un ci-dessus
                    </div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={blocks.map((_, i) => `block-${i}`)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-1.5">
                          {blocks.map((block, index) => (
                            <div key={`${block.type}-${index}`} className="group relative">
                              <SortableBlock
                                block={block}
                                index={index}
                                isSelected={selectedBlockIndex === index}
                                onRemove={removeBlock}
                                onSelect={() => {
                                  setSelectedBlockIndex(index)
                                  setRightCollapsed(false)
                                  builderLogger.blockSelected(index, block.type)
                                }}
                              />
                              {selectedBlockIndex === index && (
                                <div className="absolute right-12 top-0 h-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => moveBlockUp(index)} disabled={index === 0} className="p-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50" title="Monter">↑</button>
                                  <button onClick={() => moveBlockDown(index)} disabled={index === blocks.length - 1} className="p-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50" title="Descendre">↓</button>
                                  <button onClick={() => duplicateBlock(index)} className="p-1 text-xs bg-blue-200 hover:bg-blue-300 rounded" title="Dupliquer">🔄</button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>

              </div>
              <div className="text-[10px] text-gray-300 border-t pt-1.5 shrink-0">
                Hash: {blocksHash.slice(0, 6)}… | {blocks.length} bloc(s)
              </div>
            </div>
          )}
        </div>

        {/* ── Panneau Central : Aperçu ──────────────────────────────────── */}
        <div className={`flex flex-col overflow-hidden bg-white rounded-lg shadow transition-all duration-200 ${
          middleCollapsed ? 'w-10 min-w-[2.5rem]' : 'flex-1'
        }`}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg shrink-0">
            {!middleCollapsed && (
              <>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Aperçu</span>
                <div className="flex gap-1.5 items-center">
                  <div className="flex gap-0.5 text-xs border border-gray-200 rounded overflow-hidden">
                    <button onClick={() => setViewport('desktop')} className={`px-2 py-1 transition-colors ${viewport === 'desktop' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'}`} title="Vue Desktop">💻</button>
                    <button onClick={() => setViewport('mobile')} className={`px-2 py-1 transition-colors ${viewport === 'mobile' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'}`} title="Vue Mobile">📱</button>
                  </div>
                  <button onClick={() => window.open(`/shop/${payload.product?.id}`, '_blank')} className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-medium hover:bg-green-200 transition-colors" title="Voir la page de vente">👁️</button>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => setMiddleCollapsed((v) => !v)}
              className={`p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors ${!middleCollapsed ? 'ml-1.5' : 'mx-auto'}`}
              title={middleCollapsed ? "Agrandir l'aperçu" : "Réduire l'aperçu"}
            >
              {middleCollapsed ? '▶' : '◀'}
            </button>
          </div>
          {!middleCollapsed && (
            <div className="flex-1 overflow-y-auto p-2">
              {blocks.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">Aperçu vide — ajoutez des blocs</div>
              ) : (
                <div className={`bg-white rounded shadow-sm transition-all duration-300 ${viewport === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'}`}>
                  <PageRenderer
                    payload={{ ...payload, blocks, page_settings: pageSettings }}
                    selectedBlockIndex={selectedBlockIndex ?? undefined}
                    onBlockClick={(index) => { setSelectedBlockIndex(index); setRightCollapsed(false) }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Panneau Droit : Propriétés / Paramètres ───────────────────── */}
        {(showPageSettings || (selectedBlockIndex !== null && selectedBlock)) && (
          <div className={`flex flex-col overflow-hidden bg-white rounded-lg shadow transition-all duration-200 ${
            rightCollapsed ? 'w-10 min-w-[2.5rem]' : 'w-72 shrink-0'
          }`}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg shrink-0">
              {!rightCollapsed && (
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide truncate">
                  {showPageSettings ? '⚙️ Page' : `Bloc — ${selectedBlock?.type ?? ''}`}
                </span>
              )}
              <div className={`flex gap-1 ${rightCollapsed ? 'mx-auto' : 'ml-auto'}`}>
                <button
                  type="button"
                  onClick={() => setRightCollapsed((v) => !v)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                  title={rightCollapsed ? 'Agrandir' : 'Réduire'}
                >
                  {rightCollapsed ? '◀' : '▶'}
                </button>
                {!rightCollapsed && (
                  <button
                    type="button"
                    onClick={() => { setSelectedBlockIndex(null); setShowPageSettings(false); setRightCollapsed(false) }}
                    className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                    title="Fermer le panneau"
                    aria-label="Fermer le panneau de propriétés"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {!rightCollapsed && (
              <div className="flex-1 overflow-y-auto">
                {showPageSettings ? (
                  <PageSettingsPanel settings={pageSettings} productName={payload.product?.name} onChange={handlePageSettingsChange} />
                ) : selectedBlockIndex !== null && selectedBlock ? (
                  <PropertiesPanel block={selectedBlock} blockIndex={selectedBlockIndex} onUpdate={updateBlock} product={payload.product} />
                ) : null}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}