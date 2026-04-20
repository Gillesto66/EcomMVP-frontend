// Auteur : Gilles - Projet : AGC Space - Module : Builder - BlockEditorForm Tests
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlockEditorForm from '@/src/modules/builder/components/BlockEditorForm'
import type { Block } from '@/src/types'

describe('BlockEditorForm', () => {
  const mockOnUpdate = vi.fn()
  const mockOnClose = vi.fn()

  const heroBlock: Block = {
    type: 'hero',
    visibility: {},
  }

  beforeEach(() => {
    mockOnUpdate.mockClear()
    mockOnClose.mockClear()
  })

  describe('Rendering', () => {
    it('should render form modal', () => {
      render(
        <BlockEditorForm
          block={heroBlock}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('HERO')).toBeInTheDocument()
      expect(screen.getByText('Bloc #0')).toBeInTheDocument()
    })

    it('should render hero fields for hero block', () => {
      render(
        <BlockEditorForm
          block={heroBlock}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByPlaceholderText('Entrez le titre')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Sous-titre optionnel')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument()
    })

    it('should render buy_button fields', () => {
      const buyBlock: Block = { type: 'buy_button', visibility: {} }

      render(
        <BlockEditorForm
          block={buyBlock}
          blockIndex={1}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByPlaceholderText('ex: Acheter maintenant')).toBeInTheDocument()
    })

    it('should render text fields for text block', () => {
      const textBlock: Block = { type: 'text', visibility: {} }

      render(
        <BlockEditorForm
          block={textBlock}
          blockIndex={2}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const textarea = screen.getByPlaceholderText('Votre texte ici...')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveAttribute('rows', '4')
    })

    it('should render cancel and save buttons', () => {
      render(
        <BlockEditorForm
          block={heroBlock}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Annuler')).toBeInTheDocument()
      expect(screen.getByText('Enregistrer')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call onUpdate with hero text', async () => {
      const user = userEvent.setup()

      render(
        <BlockEditorForm
          block={heroBlock}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const titleInput = screen.getByPlaceholderText('Entrez le titre') as HTMLInputElement
      await user.type(titleInput, 'Mon Titre')

      const submitButton = screen.getByText('Enregistrer')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(0, expect.objectContaining({ text: 'Mon Titre' }))
      })
    })

    it('should call onUpdate with multiple fields', async () => {
      const user = userEvent.setup()

      render(
        <BlockEditorForm
          block={heroBlock}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const titleInput = screen.getByPlaceholderText('Entrez le titre')
      const subtitleInput = screen.getByPlaceholderText('Sous-titre optionnel')
      const imageInput = screen.getByPlaceholderText('https://...')

      await user.type(titleInput, 'Titre')
      await user.type(subtitleInput, 'Sous-titre')
      await user.type(imageInput, 'https://example.com/image.jpg')

      const submitButton = screen.getByText('Enregistrer')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          0,
          expect.objectContaining({
            text: 'Titre',
            subtitle: 'Sous-titre',
            image: 'https://example.com/image.jpg',
          })
        )
      })
    })

    it('should call onClose after submit', async () => {
      const user = userEvent.setup()

      render(
        <BlockEditorForm
          block={heroBlock}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const submitButton = screen.getByText('Enregistrer')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should not include empty fields in update', async () => {
      const user = userEvent.setup()

      render(
        <BlockEditorForm
          block={heroBlock}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const titleInput = screen.getByPlaceholderText('Entrez le titre')
      await user.type(titleInput, 'Titre')

      // Leave subtitle and image empty

      const submitButton = screen.getByText('Enregistrer')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          0,
          expect.objectContaining({
            text: 'Titre',
          })
        )
        // Verify that empty fields are not in the update
        const updates = mockOnUpdate.mock.calls[0][1]
        expect(Object.keys(updates)).toEqual(['text'])
      })
    })
  })

  describe('Form Cancellation', () => {
    it('should call onClose when cancel button clicked', async () => {
      const user = userEvent.setup()

      render(
        <BlockEditorForm
          block={heroBlock}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const cancelButton = screen.getByText('Annuler')
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal on outside click', async () => {
      const user = userEvent.setup()

      const { container } = render(
        <BlockEditorForm
          block={heroBlock}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const backdrop = container.querySelector('.bg-black')
      if (backdrop) {
        await user.click(backdrop)
      }

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not close modal on form click', async () => {
      const user = userEvent.setup()

      const { container } = render(
        <BlockEditorForm
          block={heroBlock}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const form = container.querySelector('form')
      if (form) {
        await user.click(form)
      }

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Form State', () => {
    it('should update fields as user types', async () => {
      const user = userEvent.setup()

      render(
        <BlockEditorForm
          block={heroBlock}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const titleInput = screen.getByPlaceholderText('Entrez le titre') as HTMLInputElement
      await user.type(titleInput, 'Mon Titre')

      expect(titleInput.value).toBe('Mon Titre')
    })

    it('should populate with existing block data', async () => {
      const heroBlockWithData: Block = {
        type: 'hero',
        visibility: {},
        text: 'Existing Title',
        subtitle: 'Existing Subtitle',
        image: 'https://example.com/img.jpg',
      } as any

      render(
        <BlockEditorForm
          block={heroBlockWithData}
          blockIndex={0}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const titleInput = screen.getByPlaceholderText('Entrez le titre') as HTMLInputElement
      const subtitleInput = screen.getByPlaceholderText('Sous-titre optionnel') as HTMLInputElement
      const imageInput = screen.getByPlaceholderText('https://...') as HTMLInputElement

      expect(titleInput.value).toBe('Existing Title')
      expect(subtitleInput.value).toBe('Existing Subtitle')
      expect(imageInput.value).toBe('https://example.com/img.jpg')
    })
  })

  describe('Different Block Types', () => {
    it('should handle buy_button submission', async () => {
      const user = userEvent.setup()
      const buyBlock: Block = { type: 'buy_button', visibility: {} }

      render(
        <BlockEditorForm
          block={buyBlock}
          blockIndex={1}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const labelInput = screen.getByPlaceholderText('ex: Acheter maintenant')
      await user.type(labelInput, 'Ajouter au panier')

      const submitButton = screen.getByText('Enregistrer')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(1, expect.objectContaining({ label: 'Ajouter au panier' }))
      })
    })

    it('should handle text block submission', async () => {
      const user = userEvent.setup()
      const textBlock: Block = { type: 'text', visibility: {} }

      render(
        <BlockEditorForm
          block={textBlock}
          blockIndex={2}
          onUpdate={mockOnUpdate}
          onClose={mockOnClose}
        />
      )

      const textarea = screen.getByPlaceholderText('Votre texte ici...')
      await user.type(textarea, 'Contenu du texte\nLigne 2')

      const submitButton = screen.getByText('Enregistrer')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(2, expect.objectContaining({ text: 'Contenu du texte\nLigne 2' }))
      })
    })
  })
})
