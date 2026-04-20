// Auteur : Gilles - Projet : AGC Space - Module : Builder Utilities
// Utilitaires pour le Builder V2 (validation, normalisation, etc.)
import type { Block } from '@/src/types'

/**
 * Valide un bloc avant sauvegarde
 * Assure structure minimale et types corrects
 */
export function validateBlock(block: Block): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!block.type) {
    errors.push('Block type is required')
  }

  if (typeof block.type !== 'string') {
    errors.push('Block type must be a string')
  }

  // Vérifier visibilité
  if (block.visibility && typeof block.visibility !== 'object') {
    errors.push('Block visibility must be an object')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Normalise les blocs après fetch pour assurer consistency
 * Ajoute les props manquantes avec defaults
 */
export function normalizeBlocks(blocks: Block[]): Block[] {
  return blocks.map((block) => ({
    ...block,
    visibility: block.visibility || {},
    tracking: block.tracking,
  }))
}

/**
 * Nettoie les blocs avant envoi au serveur
 * Supprime les propriétés invalides et assure la sérialisation
 */
export function sanitizeBlocksForAPI(blocks: Block[]): Block[] {
  return blocks.map((block) => {
    const sanitized: Record<string, any> = {
      type: block.type,
      visibility: block.visibility || {},
    }

    // Copier les propriétés standard
    const standardProps = ['text', 'subtitle', 'title', 'label', 'alt', 'image', 'description', 'style', 
      'action', 'items', 'data', 'affiliate', 'tracking', 'affiliate_aware',
      'showProgress', 'urgentThreshold', 'autoplay', 'muted', 'loop',
      'backgroundColor', 'textColor', 'padding', 'margin', 'borderRadius',
      'hoverEffect', 'hideMobile', 'hideDesktop', 'endDate', 'duration_hours',
      'ctaText', 'ctaLink', 'ctaButtonColor', 'formFields', 'animation', 'cssOverride',
      'video', 'poster']

    for (const prop of standardProps) {
      if (prop in block && block[prop as keyof Block] !== undefined) {
        sanitized[prop] = block[prop as keyof Block]
      }
    }

    // Assurer que tracking est un objet valide
    if (sanitized.tracking && typeof sanitized.tracking === 'object' && !Array.isArray(sanitized.tracking)) {
      sanitized.tracking = sanitized.tracking
    } else {
      delete sanitized.tracking
    }

    return sanitized as Block
  })
}

/**
 * Crée un bloc vide avec minimum requis
 */
export function createEmptyBlock(type: Block['type']): Block {
  const baseBlock: Block = {
    type,
    visibility: {},
  }

  // Ajouter les propriétés par défaut selon le type
  switch (type) {
    case 'hero':
      return {
        ...baseBlock,
        text: 'Titre principal accrocheur',
        subtitle: 'Sous-titre descriptif pour convaincre',
        image: '',
      }

    case 'features':
      return {
        ...baseBlock,
        items: [
          'Fonctionnalité 1 - Description détaillée',
          'Fonctionnalité 2 - Description détaillée',
          'Fonctionnalité 3 - Description détaillée',
        ],
      }

    case 'testimonials':
      return {
        ...baseBlock,
        items: [
          {
            author: 'Client 1',
            text: 'Excellent produit !',
            rating: 5,
          },
        ],
      }

    case 'social_proof':
      return {
        ...baseBlock,
        data: {
          total_sold: 42,
          period_days: 7,
          buyer_count: 15,
        },
      }

    case 'countdown':
      return {
        ...baseBlock,
        title: 'Offre limitée',
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        style: 'urgent',
        data: {
          deadline_iso: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          seconds_remaining: 24 * 60 * 60, // 24h en secondes
          is_expired: false,
        },
      }

    case 'stock_status':
      return {
        ...baseBlock,
        showProgress: true,
        urgentThreshold: 10,
        data: {
          stock: 100,
          level: 'ok' as const,
          label: 'En stock',
        },
      }

    case 'buy_button':
      return {
        ...baseBlock,
        label: 'Acheter maintenant',
        style: 'filled',
        action: 'add_to_cart',
      }

    case 'image':
      return {
        ...baseBlock,
        alt: 'Image descriptive',
        style: 'centered',
      }

    case 'video':
      return {
        ...baseBlock,
        autoplay: false,
        muted: true,
        loop: false,
        style: 'centered',
      }

    case 'image_gallery':
      return {
        ...baseBlock,
        items: [
          { url: '', alt: 'Image 1' },
          { url: '', alt: 'Image 2' },
          { url: '', alt: 'Image 3' },
        ],
      }

    case 'video_embed':
      return {
        ...baseBlock,
        video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        caption: 'Vidéo descriptive',
      }

    case 'faq_accordion':
      return {
        ...baseBlock,
        items: [
          { question: 'Question 1?', answer: 'Réponse 1' },
          { question: 'Question 2?', answer: 'Réponse 2' },
        ],
      }

    case 'cta_banner':
      return {
        ...baseBlock,
        title: 'Appel à l\'action',
        description: 'Description du CTA',
        ctaText: 'Cliquez ici',
        ctaLink: '#',
        backgroundColor: '#3b82f6',
      }

    case 'testimonials_carousel':
      return {
        ...baseBlock,
        items: [
          { author: 'Client 1', text: 'Excellent!', rating: 5 },
          { author: 'Client 2', text: 'Génial!', rating: 5 },
        ],
      }

    case 'pricing_table':
      return {
        ...baseBlock,
        items: [
          { name: 'Plan Starter', price: '99€', features: ['Feature 1', 'Feature 2'] },
          { name: 'Plan Pro', price: '199€', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
        ],
      }

    case 'contact_form':
      return {
        ...baseBlock,
        formFields: JSON.stringify([
          { name: 'email', type: 'email', required: true },
          { name: 'message', type: 'textarea', required: true },
        ]),
      }

    default:
      return baseBlock
  }
}

/**
 * Compare deux listes de blocs pour détecter les changements
 * Utile pour logs et perf (éviter saves redondantes)
 */
export function hasBlocksChanged(oldBlocks: Block[], newBlocks: Block[]): boolean {
  if (oldBlocks.length !== newBlocks.length) return true
  return JSON.stringify(oldBlocks) !== JSON.stringify(newBlocks)
}

/**
 * Génère un hash court pour cache invalidation
 */
export function getBlocksHash(blocks: Block[]): string {
  const json = JSON.stringify(blocks)
  let hash = 0
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).slice(0, 8)
}

/**
 * Clone profond un bloc (pour undo/redo)
 */
export function deepCloneBlock(block: Block): Block {
  return JSON.parse(JSON.stringify(block))
}

/**
 * Calcule le temps de rendu preview (approximatif, pour perf monitoring)
 */
export function measurePreviewRenderTime(callback: () => void): number {
  const start = performance.now()
  callback()
  const end = performance.now()
  return Math.round(end - start)
}

export interface BuilderTemplate {
  id: string
  name: string
  description: string
  blocks: Block[]
}

export const BUILDER_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'template_saas',
    name: 'Landing Page SaaS',
    description: 'Hero, fonctionnalités, CTA et section FAQ',
    blocks: [
      createEmptyBlock('hero'),
      createEmptyBlock('features'),
      createEmptyBlock('cta_banner'),
      createEmptyBlock('faq_accordion'),
    ],
  },
  {
    id: 'template_physical',
    name: 'Produit Physique',
    description: 'Hero, galerie, preuve sociale et bouton d’achat',
    blocks: [
      createEmptyBlock('hero'),
      createEmptyBlock('image_gallery'),
      createEmptyBlock('social_proof'),
      createEmptyBlock('buy_button'),
    ],
  },
  {
    id: 'template_ebook',
    name: 'eBook / Digital',
    description: 'Hero, description, tarification et avis',
    blocks: [
      createEmptyBlock('hero'),
      createEmptyBlock('pricing_table'),
      createEmptyBlock('testimonials'),
      createEmptyBlock('buy_button'),
    ],
  },
]


// ── Templates supplémentaires ─────────────────────────────────────────────────
BUILDER_TEMPLATES.push(
  {
    id: 'template_conversion',
    name: 'Haute Conversion',
    description: 'Urgence, preuve sociale, compte à rebours et CTA',
    blocks: [
      createEmptyBlock('hero'),
      createEmptyBlock('social_proof'),
      createEmptyBlock('countdown'),
      createEmptyBlock('stock_status'),
      createEmptyBlock('testimonials'),
      createEmptyBlock('buy_button'),
    ],
  },
  {
    id: 'template_formation',
    name: 'Formation / Cours',
    description: 'Hero, programme, vidéo, témoignages et tarification',
    blocks: [
      createEmptyBlock('hero'),
      createEmptyBlock('features'),
      createEmptyBlock('video_embed'),
      createEmptyBlock('testimonials_carousel'),
      createEmptyBlock('pricing_table'),
      createEmptyBlock('buy_button'),
    ],
  }
)

import type { PageSettings } from '@/src/types'

/**
 * Crée des paramètres de page par défaut
 */
export function createDefaultPageSettings(): PageSettings {
  return {
    background_color: '#ffffff',
    background_type: 'color',
    seo_title: '',
    seo_description: '',
    seo_og_image: '',
  }
}

/**
 * Nettoie les page_settings avant envoi au serveur
 */
export function sanitizePageSettings(settings: PageSettings): PageSettings {
  const clean: PageSettings = {}
  if (settings.background_color) clean.background_color = settings.background_color
  if (settings.background_type) clean.background_type = settings.background_type
  if (settings.background_image) clean.background_image = settings.background_image
  if (settings.seo_title) clean.seo_title = settings.seo_title
  if (settings.seo_description) clean.seo_description = settings.seo_description
  if (settings.seo_og_image) clean.seo_og_image = settings.seo_og_image
  return clean
}

/**
 * Génère le style CSS inline pour le background de la page
 */
export function buildPageBackgroundStyle(settings?: PageSettings): Record<string, string> {
  if (!settings) return {}
  const { background_type, background_color, background_image } = settings
  if (background_type === 'gradient' && background_color) {
    return { background: background_color }
  }
  if (background_type === 'image' && background_image) {
    return {
      backgroundImage: `url(${background_image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  if (background_color) {
    return { backgroundColor: background_color }
  }
  return {}
}
