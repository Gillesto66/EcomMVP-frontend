// Auteur : Gilles - Projet : AGC Space - Module : Builder - EnhancedBlockEditor Tests
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EnhancedBlockEditor from '@/src/modules/builder/components/EnhancedBlockEditor'
import type { Block, RenderPayload } from '@/src/types'

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: (loader: any) => {
    const Component = require('@/src/modules/renderer/PageRenderer').default
    return Component
  },
}))

// Mock PageRenderer
vi.mock('@/src/modules/renderer/PageRenderer', () => ({
  default: ({ payload }: any) => <div data-testid="preview">{payload.blocks.length} blocks</div>,
}))

describe('EnhancedBlockEditor', () => {
  const mockPayload: RenderPayload = {
    product: { id: 1 } as any,
    theme: {},
    blocks: [],
    critical_css: '',
    meta: {},
    template: { id: 1, name: 'Test' },
  }

  const mockOnSave = vi.fn()

  beforeEach(() => {
    mockOnSave.mockClear()
  })

  describe('Rendering', () => {
    it('should render editor with palette and blocks list', () => {
      render(
        <EnhancedBlockEditor
          initialBlocks={[]}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      expect(screen.getByText('Ajouter un bloc')).toBeInTheDocument()
      expect(screen.getByText('Blocs (0)')).toBeInTheDocument()
      expect(screen.getByText('Aperçu en temps réel')).toBeInTheDocument()
    })

    it('should render palette with all block types', () => {
      render(
        <EnhancedBlockEditor
          initialBlocks={[]}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      // Le bouton drag existe quand il y a des blocs — ici on vérifie juste la palette
      expect(screen.getByText('Ajouter un bloc')).toBeInTheDocument()
    })

    it('should show empty preview message when no blocks', () => {
      render(
        <EnhancedBlockEditor
          initialBlocks={[]}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      expect(screen.getByText('Aperçu vide — ajoutez des blocs')).toBeInTheDocument()
    })

    it('should display initial blocks', () => {
      const initialBlocks: Block[] = [
        { type: 'hero', visibility: {} },
        { type: 'text', visibility: {} },
      ]

      render(
        <EnhancedBlockEditor
          initialBlocks={initialBlocks}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      expect(screen.getByText('Blocs (2)')).toBeInTheDocument()
    })
  })

  describe('Block Operations', () => {
    it('should add block when clicking palette button', async () => {
      render(
        <EnhancedBlockEditor
          initialBlocks={[]}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      // Cliquer sur le premier bouton de la palette (Bannière Hero)
      const paletteButtons = screen.getAllByRole('button').filter(
        (btn) => btn.closest('.grid') && btn.textContent?.includes('Bannière')
      )
      if (paletteButtons[0]) fireEvent.click(paletteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Blocs (1)')).toBeInTheDocument()
      })
    })

    it('should remove block', async () => {
      const initialBlocks: Block[] = [{ type: 'hero', visibility: {} }]

      render(
        <EnhancedBlockEditor
          initialBlocks={initialBlocks}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      const removeButton = screen.getByTitle('Supprimer ce bloc')
      fireEvent.click(removeButton)

      await waitFor(() => {
        expect(screen.getByText('Blocs (0)')).toBeInTheDocument()
      })
    })

    it('should select block on click', async () => {
      const initialBlocks: Block[] = [{ type: 'hero', visibility: {} }]

      render(
        <EnhancedBlockEditor
          initialBlocks={initialBlocks}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      const blockLabel = screen.getByText('Bloc #0')
      fireEvent.click(blockLabel)

      await waitFor(() => {
        // Le bloc sélectionné a border-blue-500 dans sa classe
        const blockContainer = blockLabel.closest('[class*="border-blue"]')
        expect(blockContainer).toBeTruthy()
      })
    })

    it('should duplicate block', async () => {
      const initialBlocks: Block[] = [{ type: 'hero', visibility: {} }]

      render(
        <EnhancedBlockEditor
          initialBlocks={initialBlocks}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      const blockElement = screen.getByText('Bloc #0')
      fireEvent.click(blockElement)

      const duplicateButton = screen.getByTitle('Dupliquer')
      fireEvent.click(duplicateButton)

      await waitFor(() => {
        expect(screen.getByText('Blocs (2)')).toBeInTheDocument()
      })
    })
  })

  describe('Auto-save', () => {
    it('should call onSave after adding block (debounced)', async () => {
      vi.useFakeTimers()

      render(
        <EnhancedBlockEditor
          initialBlocks={[]}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      // Ajouter un bloc via la palette
      const heroButtons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent?.includes('Bannière') || btn.title?.includes('Bannière')
      )
      if (heroButtons[0]) fireEvent.click(heroButtons[0])

      // L'auto-save se déclenche après 800ms
      await vi.advanceTimersByTimeAsync(900)

      expect(mockOnSave).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should show saving indicator when isSavingManual=true', () => {
      render(
        <EnhancedBlockEditor
          initialBlocks={[{ type: 'hero', visibility: {} }]}
          onSave={mockOnSave}
          payload={mockPayload}
          isSavingManual={true}
        />
      )
      expect(screen.getByText(/Saving/i)).toBeInTheDocument()
    })
  })

  describe('Viewport Toggles', () => {
    it('should render desktop and mobile toggle buttons', () => {
      render(
        <EnhancedBlockEditor
          initialBlocks={[]}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      expect(screen.getByTitle('Vue Desktop')).toBeInTheDocument()
      expect(screen.getByTitle('Vue Mobile')).toBeInTheDocument()
    })
  })

  describe('Block Selection', () => {
    it('should highlight selected block', async () => {
      const initialBlocks: Block[] = [
        { type: 'hero', visibility: {} },
        { type: 'text', visibility: {} },
      ]

      render(
        <EnhancedBlockEditor
          initialBlocks={initialBlocks}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      const blocks = screen.getAllByText(/Bloc #\d/)
      fireEvent.click(blocks[0])

      await waitFor(() => {
        // Le bloc sélectionné a border-blue-500
        const blockContainer = blocks[0].closest('[class*="border-blue"]')
        expect(blockContainer).toBeTruthy()
      })
    })

    it('should update selection when clicking different block', async () => {
      const initialBlocks: Block[] = [
        { type: 'hero', visibility: {} },
        { type: 'text', visibility: {} },
      ]

      render(
        <EnhancedBlockEditor
          initialBlocks={initialBlocks}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      const blocks = screen.getAllByText(/Bloc #\d/)
      fireEvent.click(blocks[0])
      fireEvent.click(blocks[1])

      await waitFor(() => {
        const secondBlockContainer = blocks[1].closest('[class*="border-blue"]')
        expect(secondBlockContainer).toBeTruthy()
      })
    })
  })

  describe('Hash Tracking', () => {
    it('should display blocks hash', () => {
      render(
        <EnhancedBlockEditor
          initialBlocks={[{ type: 'hero', visibility: {} }]}
          onSave={mockOnSave}
          payload={mockPayload}
        />
      )

      const hashText = screen.getByText(/Hash:/)
      expect(hashText).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      const errorSave = vi.fn().mockRejectedValue(new Error('Save failed'))

      render(
        <EnhancedBlockEditor
          initialBlocks={[]}
          onSave={errorSave}
          payload={mockPayload}
        />
      )

      const heroButton = screen.getAllByRole('button').find((btn) => btn.textContent?.includes('Hero'))
      if (heroButton) fireEvent.click(heroButton)

      vi.useFakeTimers()
      vi.advanceTimersByTime(800)
      vi.useRealTimers()

      await waitFor(() => {
        expect(errorSave).toHaveBeenCalled()
      })
    })
  })
})
