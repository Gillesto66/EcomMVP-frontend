'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Builder - BlockEditor
// Éditeur drag & drop avec dnd-kit + auto-save debounced
import { useState, useCallback } from 'react'
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
import type { Block, BlockType } from '@/src/types'
import { debounce } from '@/src/lib/utils'

const AVAILABLE_BLOCKS: { type: BlockType; label: string; icon: string }[] = [
  { type: 'hero', label: 'Bannière Hero', icon: '🖼️' },
  { type: 'features', label: 'Fonctionnalités', icon: '✅' },
  { type: 'testimonials', label: 'Témoignages', icon: '💬' },
  { type: 'social_proof', label: 'Preuve sociale', icon: '🔥' },
  { type: 'countdown', label: 'Compte à rebours', icon: '⏱️' },
  { type: 'stock_status', label: 'Stock', icon: '📦' },
  { type: 'buy_button', label: 'Bouton d\'achat', icon: '🛒' },
  { type: 'text', label: 'Texte', icon: '📝' },
]

interface SortableBlockProps {
  block: Block
  index: number
  onRemove: (index: number) => void
}

function SortableBlock({ block, index, onRemove }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `block-${index}` })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const meta = AVAILABLE_BLOCKS.find((b) => b.type === block.type)

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white border border-gray-200 rounded-theme px-4 py-3 shadow-sm">
      <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 text-lg">⠿</button>
      <span className="text-xl">{meta?.icon ?? '📄'}</span>
      <span className="flex-1 text-sm font-medium text-gray-700">{meta?.label ?? block.type}</span>
      <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600 text-sm px-2">✕</button>
    </div>
  )
}

interface Props {
  initialBlocks: Block[]
  onSave: (blocks: Block[]) => Promise<void>
}

export default function BlockEditor({ initialBlocks, onSave }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Auto-save debounced — 800ms après la dernière modification
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (newBlocks: Block[]) => {
      setIsSaving(true)
      try {
        await onSave(newBlocks)
      } finally {
        setIsSaving(false)
      }
    }, 800),
    [onSave]
  )

  const updateBlocks = (newBlocks: Block[]) => {
    setBlocks(newBlocks)
    debouncedSave(newBlocks)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = blocks.findIndex((_, i) => `block-${i}` === active.id)
    const newIndex = blocks.findIndex((_, i) => `block-${i}` === over.id)
    updateBlocks(arrayMove(blocks, oldIndex, newIndex))
  }

  const addBlock = (type: BlockType) => {
    const newBlock: Block = { type, visibility: {} }
    updateBlocks([...blocks, newBlock])
  }

  const removeBlock = (index: number) => {
    updateBlocks(blocks.filter((_, i) => i !== index))
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Palette de blocs */}
      <aside className="w-56 shrink-0">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ajouter un bloc</h3>
        <div className="space-y-2">
          {AVAILABLE_BLOCKS.map((b) => (
            <button
              key={b.type}
              onClick={() => addBlock(b.type)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-theme hover:border-primary hover:text-primary transition-colors"
            >
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Zone de blocs */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Structure ({blocks.length} bloc{blocks.length > 1 ? 's' : ''})
          </h3>
          {isSaving && <span className="text-xs text-gray-400 animate-pulse">Sauvegarde…</span>}
        </div>

        {blocks.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-theme p-12 text-center text-gray-400 text-sm">
            Ajoutez des blocs depuis la palette
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((_, i) => `block-${i}`)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {blocks.map((block, index) => (
                  <SortableBlock key={`block-${index}`} block={block} index={index} onRemove={removeBlock} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
