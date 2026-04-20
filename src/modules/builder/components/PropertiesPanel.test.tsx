// Auteur : Gilles - Projet : AGC Space - Module : Builder - PropertiesPanel Tests
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PropertiesPanel from './PropertiesPanel'
import type { Block } from '@/src/types'

vi.mock('../logger', () => ({
  builderLogger: { propertyChanged: vi.fn() },
}))

describe('PropertiesPanel', () => {
  const mockOnUpdate = vi.fn()

  beforeEach(() => mockOnUpdate.mockClear())

  const makeBlock = (type: string, extra: Partial<Block> = {}): Block => ({
    type: type as Block['type'],
    visibility: {},
    ...extra,
  })

  // ── Rendu général ─────────────────────────────────────────────────────────

  it('affiche le titre avec le type de bloc', () => {
    render(<PropertiesPanel block={makeBlock('hero')} blockIndex={0} onUpdate={mockOnUpdate} />)
    expect(screen.getByText('Propriétés — hero')).toBeInTheDocument()
  })

  it('affiche les 4 onglets', () => {
    render(<PropertiesPanel block={makeBlock('hero')} blockIndex={0} onUpdate={mockOnUpdate} />)
    expect(screen.getByText('Général')).toBeInTheDocument()
    expect(screen.getByText('Style')).toBeInTheDocument()
    expect(screen.getByText('Visibility')).toBeInTheDocument()
    expect(screen.getByText('Tracking')).toBeInTheDocument()
  })

  it('affiche un message si aucun bloc sélectionné', () => {
    render(<PropertiesPanel block={null} blockIndex={0} onUpdate={mockOnUpdate} />)
    expect(screen.getByText(/Sélectionnez un bloc/i)).toBeInTheDocument()
  })

  // ── Onglet Général — Hero ─────────────────────────────────────────────────

  it('affiche les champs hero dans l\'onglet Général', () => {
    render(<PropertiesPanel block={makeBlock('hero')} blockIndex={0} onUpdate={mockOnUpdate} />)
    expect(screen.getByLabelText('Titre principal')).toBeInTheDocument()
    expect(screen.getByLabelText('Sous-titre')).toBeInTheDocument()
    expect(screen.getByLabelText("URL de l'image")).toBeInTheDocument()
  })

  it('appelle onUpdate quand le titre hero change', () => {
    render(<PropertiesPanel block={makeBlock('hero')} blockIndex={0} onUpdate={mockOnUpdate} />)
    const input = screen.getByPlaceholderText('Titre accrocheur')
    fireEvent.change(input, { target: { value: 'Nouveau titre' } })
    expect(mockOnUpdate).toHaveBeenCalledWith(0, { text: 'Nouveau titre' })
  })

  it('affiche la valeur existante du titre hero', () => {
    render(<PropertiesPanel block={makeBlock('hero', { text: 'Mon titre' })} blockIndex={0} onUpdate={mockOnUpdate} />)
    expect(screen.getByDisplayValue('Mon titre')).toBeInTheDocument()
  })

  // ── Onglet Général — Buy Button ───────────────────────────────────────────

  it('affiche les champs buy_button', () => {
    render(<PropertiesPanel block={makeBlock('buy_button')} blockIndex={0} onUpdate={mockOnUpdate} />)
    expect(screen.getByLabelText('Texte du bouton')).toBeInTheDocument()
    expect(screen.getByLabelText('Style du bouton')).toBeInTheDocument()
  })

  it('appelle onUpdate quand le label du bouton change', () => {
    render(<PropertiesPanel block={makeBlock('buy_button')} blockIndex={0} onUpdate={mockOnUpdate} />)
    const input = screen.getByPlaceholderText('Acheter maintenant')
    fireEvent.change(input, { target: { value: 'Commander' } })
    expect(mockOnUpdate).toHaveBeenCalledWith(0, { label: 'Commander' })
  })

  // ── Onglet Général — Countdown ────────────────────────────────────────────

  it('affiche le champ date de fin pour countdown', () => {
    render(<PropertiesPanel block={makeBlock('countdown')} blockIndex={0} onUpdate={mockOnUpdate} />)
    expect(screen.getByLabelText(/Date de fin/i)).toBeInTheDocument()
  })

  it('affiche le champ style pour countdown', () => {
    render(<PropertiesPanel block={makeBlock('countdown')} blockIndex={0} onUpdate={mockOnUpdate} />)
    expect(screen.getByLabelText('Style')).toBeInTheDocument()
  })

  it('appelle onUpdate avec endDate et data quand la date change', () => {
    render(<PropertiesPanel block={makeBlock('countdown')} blockIndex={0} onUpdate={mockOnUpdate} />)
    const dateInput = screen.getByLabelText(/Date de fin/i)
    fireEvent.change(dateInput, { target: { value: '2026-12-31T23:59' } })
    expect(mockOnUpdate).toHaveBeenCalledWith(0, expect.objectContaining({
      endDate: expect.any(String),
      data: expect.objectContaining({ deadline_iso: expect.any(String) }),
    }))
  })

  // ── Onglet Style ──────────────────────────────────────────────────────────

  it('affiche les contrôles de style', () => {
    render(<PropertiesPanel block={makeBlock('hero')} blockIndex={0} onUpdate={mockOnUpdate} />)
    fireEvent.click(screen.getByText('Style'))
    expect(screen.getByLabelText("Couleur d'arrière-plan")).toBeInTheDocument()
    expect(screen.getByLabelText('Couleur du texte')).toBeInTheDocument()
    expect(screen.getByLabelText('Padding')).toBeInTheDocument()
    expect(screen.getByLabelText('Margin')).toBeInTheDocument()
    expect(screen.getByLabelText('Border radius')).toBeInTheDocument()
  })

  it('appelle onUpdate quand la couleur de fond change', () => {
    render(<PropertiesPanel block={makeBlock('hero')} blockIndex={0} onUpdate={mockOnUpdate} />)
    fireEvent.click(screen.getByText('Style'))
    const colorInput = screen.getByDisplayValue('#ffffff')
    fireEvent.change(colorInput, { target: { value: '#ff0000' } })
    expect(mockOnUpdate).toHaveBeenCalledWith(0, { backgroundColor: '#ff0000' })
  })

  it('appelle onUpdate quand le padding change', () => {
    render(<PropertiesPanel block={makeBlock('hero')} blockIndex={0} onUpdate={mockOnUpdate} />)
    fireEvent.click(screen.getByText('Style'))
    const paddingInput = screen.getByLabelText('Padding')
    fireEvent.change(paddingInput, { target: { value: '40' } })
    expect(mockOnUpdate).toHaveBeenCalledWith(0, { padding: 40 })
  })

  // ── Onglet Visibility ─────────────────────────────────────────────────────

  it('affiche les contrôles de visibilité', () => {
    render(<PropertiesPanel block={makeBlock('hero')} blockIndex={0} onUpdate={mockOnUpdate} />)
    fireEvent.click(screen.getByText('Visibility'))
    expect(screen.getByLabelText('Stock min')).toBeInTheDocument()
    expect(screen.getByLabelText('Stock max')).toBeInTheDocument()
    expect(screen.getByText('Afficher sur mobile')).toBeInTheDocument()
    expect(screen.getByText('Afficher sur desktop')).toBeInTheDocument()
  })

  it('appelle onUpdate quand stock_min change', () => {
    render(<PropertiesPanel block={makeBlock('hero')} blockIndex={0} onUpdate={mockOnUpdate} />)
    fireEvent.click(screen.getByText('Visibility'))
    const stockMinInput = screen.getByLabelText('Stock min')
    fireEvent.change(stockMinInput, { target: { value: '5' } })
    expect(mockOnUpdate).toHaveBeenCalledWith(0, {
      visibility: expect.objectContaining({ stock_min: 5 }),
    })
  })

  // ── Onglet Tracking ───────────────────────────────────────────────────────

  it('affiche le champ de tracking', () => {
    render(<PropertiesPanel block={makeBlock('hero')} blockIndex={0} onUpdate={mockOnUpdate} />)
    fireEvent.click(screen.getByText('Tracking'))
    expect(screen.getByLabelText('Code de tracking')).toBeInTheDocument()
  })

  it('appelle onUpdate quand l\'événement tracking change', () => {
    render(<PropertiesPanel block={makeBlock('hero')} blockIndex={0} onUpdate={mockOnUpdate} />)
    fireEvent.click(screen.getByText('Tracking'))
    const trackingInput = screen.getByLabelText('Code de tracking')
    fireEvent.change(trackingInput, { target: { value: 'view_hero' } })
    expect(mockOnUpdate).toHaveBeenCalledWith(0, {
      tracking: expect.objectContaining({ event: 'view_hero' }),
    })
  })

  it('affiche la valeur existante du tracking', () => {
    const block = makeBlock('hero', { tracking: { event: 'click_buy' } })
    render(<PropertiesPanel block={block} blockIndex={0} onUpdate={mockOnUpdate} />)
    fireEvent.click(screen.getByText('Tracking'))
    expect(screen.getByDisplayValue('click_buy')).toBeInTheDocument()
  })
})
