// Auteur : Gilles - Projet : AGC Space - Module : Builder - PageSettingsPanel Tests
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PageSettingsPanel from './PageSettingsPanel'
import { createDefaultPageSettings } from '@/src/modules/builder/utils'
import type { PageSettings } from '@/src/types'

describe('PageSettingsPanel', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('affiche le titre du panneau', () => {
    render(
      <PageSettingsPanel
        settings={createDefaultPageSettings()}
        onChange={mockOnChange}
      />
    )
    expect(screen.getByText(/Paramètres de la page/i)).toBeInTheDocument()
  })

  it('affiche les sections Background et SEO', () => {
    render(
      <PageSettingsPanel
        settings={createDefaultPageSettings()}
        onChange={mockOnChange}
      />
    )
    expect(screen.getByText(/Fond de page/i)).toBeInTheDocument()
    // Le titre de section SEO est dans un h4
    const seoHeadings = screen.getAllByText(/SEO/i)
    expect(seoHeadings.length).toBeGreaterThanOrEqual(1)
  })

  it('affiche les présets de couleur', () => {
    render(
      <PageSettingsPanel
        settings={createDefaultPageSettings()}
        onChange={mockOnChange}
      />
    )
    // 8 présets
    const presetButtons = screen.getAllByTitle(/Blanc|Gris|Sombre|Violet|Aurore|Océan|Forêt|Coucher/)
    expect(presetButtons.length).toBeGreaterThanOrEqual(8)
  })

  it('appelle onChange quand on clique sur un préset', () => {
    render(
      <PageSettingsPanel
        settings={createDefaultPageSettings()}
        onChange={mockOnChange}
      />
    )
    const blancPreset = screen.getByTitle('Blanc')
    fireEvent.click(blancPreset)
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ background_color: '#ffffff', background_type: 'color' })
    )
  })

  it('appelle onChange quand on clique sur un préset gradient', () => {
    render(
      <PageSettingsPanel
        settings={createDefaultPageSettings()}
        onChange={mockOnChange}
      />
    )
    const violetPreset = screen.getByTitle('Violet')
    fireEvent.click(violetPreset)
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ background_type: 'gradient' })
    )
  })

  it('affiche les boutons de type (Couleur, Dégradé, Image)', () => {
    render(
      <PageSettingsPanel
        settings={createDefaultPageSettings()}
        onChange={mockOnChange}
      />
    )
    // Utiliser getAllByText car "Couleur" peut apparaître plusieurs fois
    const couleurBtns = screen.getAllByText('Couleur')
    expect(couleurBtns.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Dégradé')).toBeInTheDocument()
    expect(screen.getByText('Image')).toBeInTheDocument()
  })

  it('change le type de fond quand on clique sur Dégradé', () => {
    render(
      <PageSettingsPanel
        settings={createDefaultPageSettings()}
        onChange={mockOnChange}
      />
    )
    fireEvent.click(screen.getByText('Dégradé'))
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ background_type: 'gradient' })
    )
  })

  it('affiche le champ URL image quand type=image', () => {
    const settings: PageSettings = { ...createDefaultPageSettings(), background_type: 'image' }
    render(
      <PageSettingsPanel
        settings={settings}
        onChange={mockOnChange}
      />
    )
    expect(screen.getByPlaceholderText(/https:\/\/exemple\.com\/bg\.jpg/i)).toBeInTheDocument()
  })

  it('affiche les champs SEO', () => {
    render(
      <PageSettingsPanel
        settings={createDefaultPageSettings()}
        onChange={mockOnChange}
      />
    )
    expect(screen.getByLabelText(/Titre de la page/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Meta description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Image Open Graph/i)).toBeInTheDocument()
  })

  it('appelle onChange quand on modifie le titre SEO', () => {
    render(
      <PageSettingsPanel
        settings={createDefaultPageSettings()}
        onChange={mockOnChange}
      />
    )
    const titleInput = screen.getByLabelText(/Titre de la page/i)
    fireEvent.change(titleInput, { target: { value: 'Mon super produit' } })
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ seo_title: 'Mon super produit' })
    )
  })

  it('appelle onChange quand on modifie la meta description', () => {
    render(
      <PageSettingsPanel
        settings={createDefaultPageSettings()}
        onChange={mockOnChange}
      />
    )
    const descInput = screen.getByLabelText(/Meta description/i)
    fireEvent.change(descInput, { target: { value: 'Description SEO' } })
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ seo_description: 'Description SEO' })
    )
  })

  it('affiche l\'aperçu SERP quand seo_title est renseigné', () => {
    const settings: PageSettings = {
      ...createDefaultPageSettings(),
      seo_title: 'Mon produit',
      seo_description: 'Description courte',
    }
    render(
      <PageSettingsPanel
        settings={settings}
        onChange={mockOnChange}
      />
    )
    expect(screen.getByText('Aperçu Google')).toBeInTheDocument()
    expect(screen.getByText('Mon produit')).toBeInTheDocument()
  })

  it('affiche le nom du produit comme placeholder du titre SEO', () => {
    render(
      <PageSettingsPanel
        settings={createDefaultPageSettings()}
        productName="Formation Django"
        onChange={mockOnChange}
      />
    )
    const titleInput = screen.getByLabelText(/Titre de la page/i)
    expect(titleInput).toHaveAttribute('placeholder', 'Formation Django')
  })

  it('affiche le compteur de caractères pour le titre SEO', () => {
    const settings: PageSettings = { ...createDefaultPageSettings(), seo_title: 'Test' }
    render(
      <PageSettingsPanel
        settings={settings}
        onChange={mockOnChange}
      />
    )
    expect(screen.getByText('4/70 caractères')).toBeInTheDocument()
  })

  it('affiche le compteur de caractères pour la description', () => {
    const settings: PageSettings = { ...createDefaultPageSettings(), seo_description: 'Desc' }
    render(
      <PageSettingsPanel
        settings={settings}
        onChange={mockOnChange}
      />
    )
    expect(screen.getByText('4/160 caractères')).toBeInTheDocument()
  })
})
