// Auteur : Gilles - Projet : AGC Space - Module : Builder - EnhancedBlockEditor Tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EnhancedBlockEditor from './EnhancedBlockEditor'
import type { Block, RenderPayload } from '@/src/types'

// Mock des dépendances
jest.mock('@/src/modules/renderer/PageRenderer', () => {
  return function MockPageRenderer({ payload, selectedBlockIndex }: { payload: RenderPayload; selectedBlockIndex?: number }) {
    return (
      <div data-testid="page-renderer">
        <div>Preview: {payload.blocks.length} blocks</div>
        {selectedBlockIndex !== undefined && (
          <div data-testid="selected-block">Selected: {selectedBlockIndex}</div>
        )}
      </div>
    )
  }
})

jest.mock('@/src/modules/builder/logger', () => ({
  builderLogger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    blockAdded: jest.fn(),
    blockRemoved: jest.fn(),
    blockMoved: jest.fn(),
    blockSelected: jest.fn(),
    propertyChanged: jest.fn(),
    autoSaveStart: jest.fn(),
    autoSaveEnd: jest.fn(),
    performanceWarning: jest.fn(),
  },
}))

const mockPayload: RenderPayload = {
  product: { id: 1, name: 'Test Product', owner: 1, owner_username: 'testuser' },
  theme: { id: 1, name: 'Default', variables: {} },
  blocks: [],
  critical_css: '',
}

const mockOnSave = jest.fn().mockResolvedValue(undefined)
const mockOnBlocksChange = jest.fn()

describe('EnhancedBlockEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders initial state with empty blocks', () => {
    render(
      <EnhancedBlockEditor
        initialBlocks={[]}
        onSave={mockOnSave}
        payload={mockPayload}
        onBlocksChange={mockOnBlocksChange}
      />
    )

    expect(screen.getByText('Builder V2 — Test Product')).toBeInTheDocument()
    expect(screen.getByText('Blocs (0)')).toBeInTheDocument()
    expect(screen.getByText('Aucun bloc — commencez par en ajouter un')).toBeInTheDocument()
    expect(screen.getByText('Aperçu vide — ajoutez des blocs')).toBeInTheDocument()
  })

  it('adds a block when clicking palette button', async () => {
    const user = userEvent.setup()

    render(
      <EnhancedBlockEditor
        initialBlocks={[]}
        onSave={mockOnSave}
        payload={mockPayload}
        onBlocksChange={mockOnBlocksChange}
      />
    )

    const heroButton = screen.getByTitle('Bannière Hero')
    await user.click(heroButton)

    await waitFor(() => {
      expect(screen.getByText('Blocs (1)')).toBeInTheDocument()
      expect(mockOnBlocksChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: 'hero' })
        ])
      )
    })
  })

  it('removes a block when clicking delete button', async () => {
    const user = userEvent.setup()

    render(
      <EnhancedBlockEditor
        initialBlocks={[{ type: 'hero', text: 'Test' }]}
        onSave={mockOnSave}
        payload={mockPayload}
        onBlocksChange={mockOnBlocksChange}
      />
    )

    const deleteButton = screen.getByTitle('Supprimer ce bloc')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Blocs (0)')).toBeInTheDocument()
      expect(mockOnBlocksChange).toHaveBeenCalledWith([])
    })
  })

  it('selects a block and shows properties panel', async () => {
    const user = userEvent.setup()

    render(
      <EnhancedBlockEditor
        initialBlocks={[{ type: 'hero', text: 'Test' }]}
        onSave={mockOnSave}
        payload={mockPayload}
        onBlocksChange={mockOnBlocksChange}
      />
    )

    const block = screen.getByText('Bannière Hero')
    await user.click(block)

    expect(screen.getByText('Propriétés — hero')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
  })

  it('updates preview immediately when block changes', async () => {
    const user = userEvent.setup()

    render(
      <EnhancedBlockEditor
        initialBlocks={[{ type: 'hero', text: 'Test' }]}
        onSave={mockOnSave}
        payload={mockPayload}
        onBlocksChange={mockOnBlocksChange}
      />
    )

    // Select block
    const block = screen.getByText('Bannière Hero')
    await user.click(block)

    // Change title
    const titleInput = screen.getByDisplayValue('Test')
    await user.clear(titleInput)
    await user.type(titleInput, 'New Title')

    // Check that preview was updated immediately
    expect(mockOnBlocksChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'hero', text: 'New Title' })
      ])
    )
  })

  it('highlights selected block in preview', async () => {
    const user = userEvent.setup()

    render(
      <EnhancedBlockEditor
        initialBlocks={[{ type: 'hero', text: 'Test' }]}
        onSave={mockOnSave}
        payload={mockPayload}
        onBlocksChange={mockOnBlocksChange}
      />
    )

    // Select block
    const block = screen.getByText('Bannière Hero')
    await user.click(block)

    // Check that selected block index is passed to preview
    expect(screen.getByTestId('selected-block')).toHaveTextContent('Selected: 0')
  })

  it('switches between desktop and mobile viewport', async () => {
    const user = userEvent.setup()

    render(
      <EnhancedBlockEditor
        initialBlocks={[{ type: 'hero', text: 'Test' }]}
        onSave={mockOnSave}
        payload={mockPayload}
        onBlocksChange={mockOnBlocksChange}
      />
    )

    const mobileButton = screen.getByTitle('Vue Mobile')
    await user.click(mobileButton)

    expect(mobileButton).toHaveClass('bg-blue-100', 'text-blue-600')
  })

  it('duplicates a block', async () => {
    const user = userEvent.setup()

    render(
      <EnhancedBlockEditor
        initialBlocks={[{ type: 'hero', text: 'Test' }]}
        onSave={mockOnSave}
        payload={mockPayload}
        onBlocksChange={mockOnBlocksChange}
      />
    )

    // Select block to show action buttons
    const block = screen.getByText('Bannière Hero')
    await user.click(block)

    // Click duplicate button
    const duplicateButton = screen.getByTitle('Dupliquer')
    await user.click(duplicateButton)

    await waitFor(() => {
      expect(screen.getByText('Blocs (2)')).toBeInTheDocument()
      expect(mockOnBlocksChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: 'hero' }),
          expect.objectContaining({ type: 'hero' })
        ])
      )
    })
  })

  it('moves blocks up and down', async () => {
    const user = userEvent.setup()

    render(
      <EnhancedBlockEditor
        initialBlocks={[
          { type: 'hero', text: 'First' },
          { type: 'buy_button', label: 'Second' }
        ]}
        onSave={mockOnSave}
        payload={mockPayload}
        onBlocksChange={mockOnBlocksChange}
      />
    )

    // Select second block
    const buyButtonBlock = screen.getByText('Bouton d\'achat')
    await user.click(buyButtonBlock)

    // Move up
    const moveUpButton = screen.getByTitle('Monter')
    await user.click(moveUpButton)

    await waitFor(() => {
      expect(mockOnBlocksChange).toHaveBeenCalledWith([
        expect.objectContaining({ type: 'buy_button' }),
        expect.objectContaining({ type: 'hero' })
      ])
    })
  })

  it('shows auto-save indicator', async () => {
    const user = userEvent.setup()

    render(
      <EnhancedBlockEditor
        initialBlocks={[{ type: 'hero', text: 'Test' }]}
        onSave={mockOnSave}
        payload={mockPayload}
        onBlocksChange={mockOnBlocksChange}
      />
    )

    // Select block and make change
    const block = screen.getByText('Bannière Hero')
    await user.click(block)

    const titleInput = screen.getByDisplayValue('Test')
    await user.clear(titleInput)
    await user.type(titleInput, 'New Title')

    // Check for saving indicator (debounced, so might not appear immediately)
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('includes image and video blocks in palette', () => {
    render(
      <EnhancedBlockEditor
        initialBlocks={[]}
        onSave={mockOnSave}
        payload={mockPayload}
        onBlocksChange={mockOnBlocksChange}
      />
    )

    expect(screen.getByTitle('Image')).toBeInTheDocument()
    expect(screen.getByTitle('Vidéo')).toBeInTheDocument()
  })
})