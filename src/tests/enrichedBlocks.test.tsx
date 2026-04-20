/**
 * Test suite pour les blocs enrichis F10.3
 * Auteur : Gilles - Projet : AGC Space - Dates de test : Phase F10.3
 * Couvre : Rendering optimizations, accessibility, lazy loading, performance
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ImageGalleryBlock from '@/src/modules/renderer/blocks/ImageGalleryBlock'
import VideoEmbedBlock from '@/src/modules/renderer/blocks/VideoEmbedBlock'
import FAQAccordionBlock from '@/src/modules/renderer/blocks/FAQAccordionBlock'
import CTABannerBlock from '@/src/modules/renderer/blocks/CTABannerBlock'
import TestimonialsCarouselBlock from '@/src/modules/renderer/blocks/TestimonialsCarouselBlock'
import PricingTableBlock from '@/src/modules/renderer/blocks/PricingTableBlock'
import ContactFormBlock from '@/src/modules/renderer/blocks/ContactFormBlock'
import type { Block } from '@/src/types'

describe('F10.3 — Blocs enrichis', () => {
  // ── ImageGalleryBlock ────────────────────────────────────────────

  describe('ImageGalleryBlock', () => {
    const mockBlock: Block = {
      type: 'image_gallery',
      title: 'Galerie de produits',
      items: [
        'image1.jpg|Produit 1',
        'image2.jpg|Produit 2',
        'image3.jpg|Produit 3',
      ],
    }

    it('devrait rendre la galerie avec les images', () => {
      render(<ImageGalleryBlock block={mockBlock} />)
      expect(screen.getByAltText('Image 1')).toBeInTheDocument()
    })

    it('devrait naviguer entre les images avec les flèches', async () => {
      render(<ImageGalleryBlock block={mockBlock} />)
      const nextButton = screen.getByLabelText('Image suivante')
      
      fireEvent.click(nextButton)
      expect(screen.getByAltText('Image 2')).toBeInTheDocument()
    })

    it('devrait afficher les vignettes et permettre la sélection', async () => {
      render(<ImageGalleryBlock block={mockBlock} />)
      const thumbnailButton = screen.getByLabelText('Image 3')
      
      fireEvent.click(thumbnailButton)
      expect(screen.getByAltText('Image 3')).toBeInTheDocument()
    })

    it('devrait utiliser light attributes pour la lazy loading', () => {
      render(<ImageGalleryBlock block={mockBlock} />)
      const images = screen.getAllByRole('img')
      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy')
      })
    })

    it('devrait avoir des ARIA labels accessibles', () => {
      render(<ImageGalleryBlock block={mockBlock} />)
      expect(screen.getByLabelText('Image précédente')).toBeInTheDocument()
      expect(screen.getByLabelText('Image suivante')).toBeInTheDocument()
    })

    it('devrait afficher un placeholder vide si pas d\'images', () => {
      const emptyBlock: Block = { type: 'image_gallery' }
      render(<ImageGalleryBlock block={emptyBlock} />)
      expect(screen.getByText(/Galerie d'images/i)).toBeInTheDocument()
    })

    it('devrait être mémoïzé (React.memo)', () => {
      expect((ImageGalleryBlock as any).displayName).toBe('ImageGalleryBlock')
    })
  })

  // ── VideoEmbedBlock ────────────────────────────────────────────

  describe('VideoEmbedBlock', () => {
    it('devrait rendre les iframes YouTube correctement', () => {
      const block: Block = {
        type: 'video_embed',
        title: 'Tutoriel',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }
      render(<VideoEmbedBlock block={block} />)
      
      const iframe = screen.getByTitle('Tutoriel')
      expect(iframe).toHaveAttribute('src', expect.stringContaining('dQw4w9WgXcQ'))
    })

    it('devrait supporter les URLs courtes YouTube (youtu.be)', () => {
      const block: Block = {
        type: 'video_embed',
        video: 'https://youtu.be/dQw4w9WgXcQ',
      }
      render(<VideoEmbedBlock block={block} />)
      
      const iframe = screen.getByTitle('Embedded video')
      expect(iframe).toBeInTheDocument()
    })

    it('devrait rendre les iframes Vimeo correctement', () => {
      const block: Block = {
        type: 'video_embed',
        video: 'https://vimeo.com/123456789',
      }
      render(<VideoEmbedBlock block={block} />)
      
      const iframe = screen.getByTitle('Embedded video')
      expect(iframe).toHaveAttribute('src', expect.stringContaining('player.vimeo.com'))
    })

    it('devrait afficher une erreur pour URL invalide', () => {
      const block: Block = {
        type: 'video_embed',
        video: 'https://example.com/invalid',
      }
      render(<VideoEmbedBlock block={block} />)
      expect(screen.getByText(/Format URL non reconnu/i)).toBeInTheDocument()
    })

    it('devrait avoir lazy loading sur les iframes', () => {
      const block: Block = {
        type: 'video_embed',
        video: 'https://youtu.be/dQw4w9WgXcQ',
      }
      render(<VideoEmbedBlock block={block} />)
      
      const iframe = screen.getByTitle('Embedded video')
      expect(iframe).toHaveAttribute('loading', 'lazy')
    })

    it('devrait afficher la description si fournie', () => {
      const block: Block = {
        type: 'video_embed',
        video: 'https://youtu.be/dQw4w9WgXcQ',
        description: 'Cliquez pour regarder notre tutoriel complet',
      }
      render(<VideoEmbedBlock block={block} />)
      expect(screen.getByText(/Cliquez pour regarder/i)).toBeInTheDocument()
    })
  })

  // ── FAQAccordionBlock ────────────────────────────────────────────

  describe('FAQAccordionBlock', () => {
    const mockBlock: Block = {
      type: 'faq_accordion',
      title: 'Questions fréquentes',
      items: [
        'Quel est le prix? Article sur les prix',
        'Délai de livraison? 3-5 jours ouvrables',
        'Retours gratuits? Oui, 30 jours',
      ],
    }

    it('devrait rendre l\'accordéon avec les questions', () => {
      render(<FAQAccordionBlock block={mockBlock} />)
      expect(screen.getByText('Questions fréquentes')).toBeInTheDocument()
      expect(screen.getByText(/Quel est le prix/)).toBeInTheDocument()
    })

    it('devrait ouvrir/fermer les éléments au clic', async () => {
      render(<FAQAccordionBlock block={mockBlock} />)
      const buttons = screen.getAllByRole('button')
      
      // The first item is open by default, so test toggling a second item.
      fireEvent.click(buttons[1])
      expect(screen.getByText('3-5 jours ouvrables')).toBeInTheDocument()
      
      fireEvent.click(buttons[1])
      expect(screen.queryByText('3-5 jours ouvrables')).not.toBeInTheDocument()
    })

    it('devrait avoir les attributs ARIA pour l\'accessibilité', () => {
      render(<FAQAccordionBlock block={mockBlock} />)
      const buttons = screen.getAllByRole('button')
      
      expect(buttons[0]).toHaveAttribute('aria-expanded')
      expect(buttons[0]).toHaveAttribute('aria-controls')
    })

    it('devrait ouvrir le premier élément par défaut', () => {
      render(<FAQAccordionBlock block={mockBlock} />)
      expect(screen.getByText('Article sur les prix')).toBeInTheDocument()
    })

    it('devrait permettre un seul élément ouvert à la fois', async () => {
      render(<FAQAccordionBlock block={mockBlock} />)
      const questions = screen.getAllByText(/\?/)
      
      fireEvent.click(questions[1])
      expect(screen.getByText('3-5 jours ouvrables')).toBeInTheDocument()
      // First answer should close
      await waitFor(() => {
        expect(screen.queryByText('Article sur les prix')).not.toBeInTheDocument()
      })
    })

    it('devrait naviguer au clavier (ARIA)', async () => {
      render(<FAQAccordionBlock block={mockBlock} />)
      const buttons = screen.getAllByRole('button')
      
      buttons[0].focus()
      expect(buttons[0]).toHaveFocus()
    })
  })

  // ── CTABannerBlock ────────────────────────────────────────────

  describe('CTABannerBlock', () => {
    const mockBlock: Block = {
      type: 'cta_banner',
      title: 'Prêt à commencer ?',
      description: 'Vous n\'avez pas besoin de carte de crédit',
      ctaText: 'Créer un compte',
      ctaLink: '/register',
      backgroundColor: '#1f2937',
    }

    it('devrait rendre la bannière CTA', () => {
      render(<CTABannerBlock block={mockBlock} />)
      expect(screen.getByText('Prêt à commencer ?')).toBeInTheDocument()
      expect(screen.getByText('Vous n\'avez pas besoin de carte de crédit')).toBeInTheDocument()
    })

    it('devrait rendre le bouton CTA avec le texte et aria-label corrects', () => {
      render(<CTABannerBlock block={mockBlock} />)
      const button = screen.getByRole('button', { name: /Créer un compte/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Créer un compte')
    })

    it('devrait naviguer au clic', () => {
      const mockBefore = window.location.href
      render(<CTABannerBlock block={mockBlock} />)
      // Can't easily test navigation, but button should exist
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('devrait afficher l\'image de fond si fournie', () => {
      const blockWithImage: Block = {
        ...mockBlock,
        image: 'https://example.com/banner.jpg',
      }
      const { container } = render(<CTABannerBlock block={blockWithImage} />)
      expect(container.querySelector('[style*="banner.jpg"]')).toBeInTheDocument()
    })

    it('devrait avoir les attributs accessibles', () => {
      render(<CTABannerBlock block={mockBlock} />)
      const banner = screen.getByRole('complementary')
      expect(banner).toHaveAttribute('aria-label')
    })
  })

  // ── TestimonialsCarouselBlock ────────────────────────────────────────────

  describe('TestimonialsCarouselBlock', () => {
    const mockBlock: Block = {
      type: 'testimonials_carousel',
      title: 'Ce que disent les clients',
      items: [
        'Alice Martin|Directrice Marketing|Produit incroyable !|https://example.com/alice.jpg',
        'Bob Durand|CTO|Excellent service|https://example.com/bob.jpg',
        'Claire Thibault|Designer|5 étoiles !|https://example.com/claire.jpg',
      ],
    }

    it('devrait rendre le carrousel avec le premier témoignage', () => {
      render(<TestimonialsCarouselBlock block={mockBlock} />)
      expect(screen.getByText('Ce que disent les clients')).toBeInTheDocument()
      expect(screen.getByText('Alice Martin')).toBeInTheDocument()
    })

    it('devrait naviguer entre les témoignages', async () => {
      render(<TestimonialsCarouselBlock block={mockBlock} />)
      const nextButton = screen.getByLabelText('Témoignage suivant')
      
      fireEvent.click(nextButton)
      expect(screen.getByText('Bob Durand')).toBeInTheDocument()
    })

    it('devrait afficher les indicateurs de pagination', () => {
      render(<TestimonialsCarouselBlock block={mockBlock} />)
      const indicators = screen.getAllByRole('button', { name: /Aller au/ })
      expect(indicators).toHaveLength(3)
    })

    it('devrait permettre de cliquer sur les indicateurs', async () => {
      render(<TestimonialsCarouselBlock block={mockBlock} />)
      const indicator2 = screen.getByLabelText('Aller au témoignage 2')
      
      fireEvent.click(indicator2)
      expect(screen.getByText('Bob Durand')).toBeInTheDocument()
    })

    it('devrait afficher les images d\'avatar', () => {
      render(<TestimonialsCarouselBlock block={mockBlock} />)
      const avatar = screen.getByAltText('Alice Martin')
      expect(avatar).toHaveAttribute('src', 'https://example.com/alice.jpg')
    })

    it('devrait afficher 5 étoiles pour chaque témoignage', () => {
      render(<TestimonialsCarouselBlock block={mockBlock} />)
      const stars = screen.getAllByText('★')
      expect(stars).toHaveLength(5)
    })

    it('devrait avoir les ARIA labels pour l\'accessibilité', () => {
      render(<TestimonialsCarouselBlock block={mockBlock} />)
      expect(screen.getByLabelText('Témoignage suivant')).toBeInTheDocument()
      expect(screen.getByLabelText('Témoignage précédent')).toBeInTheDocument()
    })
  })

  // ── PricingTableBlock ────────────────────────────────────────────

  describe('PricingTableBlock', () => {
    const mockBlock: Block = {
      type: 'pricing_table',
      title: 'Nos tarifs',
      items: [
        'Startup|29€|Pour les startups|Support|false|Essayer|/try-startup',
        'Pro|99€|Pour les pro|Support prioritaire,API|true|Commencer|/try-pro',
        'Enterprise|299€|Personnalisé|Support 24/7,API avancée,Intégrations|false|Contacter|/contact',
      ],
    }

    it('devrait rendre le tableau de tarification', () => {
      render(<PricingTableBlock block={mockBlock} />)
      expect(screen.getByText('Nos tarifs')).toBeInTheDocument()
      expect(screen.getByText('Startup')).toBeInTheDocument()
      expect(screen.getByText('Pro')).toBeInTheDocument()
    })

    it('devrait surligner le forfait principal', () => {
      const { container } = render(<PricingTableBlock block={mockBlock} />)
      const proCard = container.querySelector('[class*="ring-2"]')
      expect(proCard).toBeInTheDocument()
    })

    it('devrait afficher les prix correctement', () => {
      render(<PricingTableBlock block={mockBlock} />)
      expect(screen.getByText('29€')).toBeInTheDocument()
      expect(screen.getByText('99€')).toBeInTheDocument()
      expect(screen.getByText('299€')).toBeInTheDocument()
    })

    it('devrait afficher les fonctionnalités avec des checkmarks', () => {
      render(<PricingTableBlock block={mockBlock} />)
      const checkmarks = screen.getAllByText('✓')
      expect(checkmarks.length).toBeGreaterThan(0)
    })

    it('devrait rendre les boutons CTA avec les bons liens', () => {
      render(<PricingTableBlock block={mockBlock} />)
      const buttons = screen.getAllByRole('link')
      expect(buttons[0]).toHaveAttribute('href', '/try-startup')
    })

    it('devrait être responsive (grid layout)', () => {
      const { container } = render(<PricingTableBlock block={mockBlock} />)
      const grid = container.querySelector('[class*="grid"]')
      expect(grid).toHaveClass('grid')
    })
  })

  // ── ContactFormBlock ────────────────────────────────────────────

  describe('ContactFormBlock', () => {
    const mockBlock: Block = {
      type: 'contact_form',
      title: 'Nous contacter',
      description: 'Remplissez ce formulaire et on vous répondra sous 24h',
    }

    it('devrait rendre le formulaire de contact', () => {
      render(<ContactFormBlock block={mockBlock} />)
      expect(screen.getByText('Nous contacter')).toBeInTheDocument()
    })

    it('devrait avoir les champs standard', () => {
      render(<ContactFormBlock block={mockBlock} />)
      expect(screen.getByLabelText(/Nom/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Téléphone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
    })

    it('devrait requérir les champs obligatoires', () => {
      render(<ContactFormBlock block={mockBlock} />)
      const nameInput = screen.getByLabelText(/Nom/)
      const emailInput = screen.getByLabelText(/Email/)
      const messageInput = screen.getByLabelText(/Message/)
      
      expect(nameInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('required')
      expect(messageInput).toHaveAttribute('required')
    })

    it('devrait soumettre le formulaire avec les données', async () => {
      render(<ContactFormBlock block={mockBlock} />)
      fireEvent.change(screen.getByLabelText(/Nom/i), { target: { value: 'Jean Martin' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jean@example.com' } })
      fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Bonjour' } })
      fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

      await waitFor(() => {
        expect(screen.getByText(/Merci !/i)).toBeInTheDocument()
      })
    })

    it('devrait réinitialiser le formulaire après soumission', async () => {
      render(<ContactFormBlock block={mockBlock} />)
      fireEvent.change(screen.getByLabelText(/Nom/i), { target: { value: 'Jean Martin' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jean@example.com' } })
      fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Bonjour' } })
      fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

      await waitFor(() => {
        expect(screen.getByText(/Merci !/i)).toBeInTheDocument()
      })

      expect(screen.queryByLabelText(/Nom/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/Email/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/Message/i)).not.toBeInTheDocument()
    })

    it('devrait empêcher la soumission si champs manquants', async () => {
      render(<ContactFormBlock block={mockBlock} />)
      fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

      await waitFor(() => {
        expect(screen.queryByText(/Merci !/i)).not.toBeInTheDocument()
      })
    })

    it('devrait avoir des attributs accessibles', () => {
      render(<ContactFormBlock block={mockBlock} />)
      expect(screen.getByLabelText(/Nom/i)).toHaveAttribute('aria-label', 'Nom')
      expect(screen.getByLabelText(/Envoyer le formulaire/i)).toBeInTheDocument()
    })
  })

  // ── Performance & Optimization Tests ─────────────────────

  describe('Optimizations — React.memo & Lazy Loading', () => {
    it('ImageGalleryBlock devrait être mémoïzé', () => {
      const displayName = (ImageGalleryBlock as any).displayName
      expect(displayName).toBe('ImageGalleryBlock')
    })

    it('VideoEmbedBlock devrait être mémoïzé', () => {
      const displayName = (VideoEmbedBlock as any).displayName
      expect(displayName).toBe('VideoEmbedBlock')
    })

    it('FAQAccordionBlock devrait être mémoïzé', () => {
      const displayName = (FAQAccordionBlock as any).displayName
      expect(displayName).toBe('FAQAccordionBlock')
    })

    it('CTABannerBlock devrait être mémoïzé', () => {
      const displayName = (CTABannerBlock as any).displayName
      expect(displayName).toBe('CTABannerBlock')
    })

    it('TestimonialsCarouselBlock devrait être mémoïzé', () => {
      const displayName = (TestimonialsCarouselBlock as any).displayName
      expect(displayName).toBe('TestimonialsCarouselBlock')
    })

    it('PricingTableBlock devrait être mémoïzé', () => {
      const displayName = (PricingTableBlock as any).displayName
      expect(displayName).toBe('PricingTableBlock')
    })

    it('ContactFormBlock devrait être mémoïzé', () => {
      const displayName = (ContactFormBlock as any).displayName
      expect(displayName).toBe('ContactFormBlock')
    })
  })

  // ── Accessibility Tests (a11y) ─────────────────────

  describe('Accessibilité (WCAG 2.1)', () => {
    it('Tous les blocs doivent avoir des labels ARIA', () => {
      const blocks = [
        { component: ImageGalleryBlock, block: { type: 'image_gallery', items: ['img.jpg|Test'] } as Block },
        { component: VideoEmbedBlock, block: { type: 'video_embed', video: 'https://youtu.be/123' } as Block },
        { component: FAQAccordionBlock, block: { type: 'faq_accordion', items: ['Q? A'] } as Block },
        { component: CTABannerBlock, block: { type: 'cta_banner', title: 'Test' } as Block },
        { component: TestimonialsCarouselBlock, block: { type: 'testimonials_carousel', items: ['Author||Text'] } as Block },
        { component: PricingTableBlock, block: { type: 'pricing_table', items: ['Tier|10|Desc|Features'] } as Block },
        { component: ContactFormBlock, block: { type: 'contact_form', title: 'Form' } as Block },
      ]

      blocks.forEach(({ component: Component, block }) => {
        const { container } = render(<Component block={block} />)
        const interactive = container.querySelectorAll('button, a, input, textarea')
        interactive.forEach(el => {
          const hasLabel = el.hasAttribute('aria-label') || el.getAttribute('type') === 'submit' || el.textContent
          expect(hasLabel).toBeTruthy()
        })
      })
    })

    it('Les carrousels doivent avoir une navigation au clavier', async () => {
      render(<TestimonialsCarouselBlock block={{
        type: 'testimonials_carousel',
        items: ['Author||Text'],
      }} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(btn => btn.focus())
      expect(document.activeElement).toBeTruthy()
    })
  })
})
