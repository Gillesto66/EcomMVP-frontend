// Auteur : Gilles - Projet : AGC Space - Module : Builder Utils Tests
import { describe, it, expect } from 'vitest'
import {
  validateBlock,
  normalizeBlocks,
  createEmptyBlock,
  hasBlocksChanged,
  getBlocksHash,
  deepCloneBlock,
  sanitizeBlocksForAPI,
  createDefaultPageSettings,
  sanitizePageSettings,
  buildPageBackgroundStyle,
  BUILDER_TEMPLATES,
} from '@/src/modules/builder/utils'
import type { Block } from '@/src/types'

describe('Builder Utilities', () => {
  describe('validateBlock', () => {
    it('should validate a valid block', () => {
      const block: Block = { type: 'hero', visibility: {} }
      const result = validateBlock(block)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject block without type', () => {
      const block = { visibility: {} } as any
      const result = validateBlock(block)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Block type is required')
    })

    it('should reject block with invalid type', () => {
      const block = { type: 123, visibility: {} } as any
      const result = validateBlock(block)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Block type must be a string')
    })

    it('should reject block with invalid visibility', () => {
      const block = { type: 'hero', visibility: 'invalid' } as any
      const result = validateBlock(block)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Block visibility must be an object')
    })
  })

  describe('normalizeBlocks', () => {
    it('should add missing visibility', () => {
      const blocks = [{ type: 'hero' } as any]
      const normalized = normalizeBlocks(blocks)
      expect(normalized[0].visibility).toEqual({})
    })

    it('should preserve existing visibility', () => {
      const blocks = [{ type: 'hero', visibility: { stock_min: 5 } }]
      const normalized = normalizeBlocks(blocks)
      expect(normalized[0].visibility).toEqual({ stock_min: 5 })
    })

    it('should handle multiple blocks', () => {
      const blocks = [{ type: 'hero' }, { type: 'text', visibility: {} }] as any
      const normalized = normalizeBlocks(blocks)
      expect(normalized).toHaveLength(2)
      expect(normalized[0].visibility).toBeDefined()
      expect(normalized[1].visibility).toBeDefined()
    })
  })

  describe('createEmptyBlock', () => {
    it('should create block with correct type', () => {
      const block = createEmptyBlock('hero')
      expect(block.type).toBe('hero')
      expect(block.visibility).toEqual({})
    })

    it('should work for all block types', () => {
      const types: Block['type'][] = ['hero', 'features', 'text', 'buy_button']
      types.forEach((type) => {
        const block = createEmptyBlock(type)
        expect(block.type).toBe(type)
        expect(block.visibility).toBeDefined()
      })
    })
  })

  describe('hasBlocksChanged', () => {
    it('should detect length change', () => {
      const old = [{ type: 'hero', visibility: {} }]
      const new_ = [{ type: 'hero', visibility: {} }, { type: 'text', visibility: {} }]
      expect(hasBlocksChanged(old, new_)).toBe(true)
    })

    it('should detect content change', () => {
      const old = [{ type: 'hero', visibility: {} }]
      const new_ = [{ type: 'text', visibility: {} }]
      expect(hasBlocksChanged(old, new_)).toBe(true)
    })

    it('should detect no change', () => {
      const old = [{ type: 'hero', visibility: {} }]
      const new_ = [{ type: 'hero', visibility: {} }]
      expect(hasBlocksChanged(old, new_)).toBe(false)
    })

    it('should handle empty arrays', () => {
      expect(hasBlocksChanged([], [])).toBe(false)
      expect(hasBlocksChanged([], [{ type: 'hero', visibility: {} }])).toBe(true)
    })
  })

  describe('getBlocksHash', () => {
    it('should generate consistent hash', () => {
      const blocks = [{ type: 'hero', visibility: {} }]
      const hash1 = getBlocksHash(blocks)
      const hash2 = getBlocksHash(blocks)
      expect(hash1).toBe(hash2)
    })

    it('should generate different hash for different blocks', () => {
      const blocks1 = [{ type: 'hero', visibility: {} }]
      const blocks2 = [{ type: 'text', visibility: {} }]
      const hash1 = getBlocksHash(blocks1)
      const hash2 = getBlocksHash(blocks2)
      expect(hash1).not.toBe(hash2)
    })

    it('should return 8-char hex string', () => {
      const blocks = [{ type: 'hero', visibility: {} }]
      const hash = getBlocksHash(blocks)
      expect(hash).toMatch(/^[0-9a-f]{8}$/)
    })
  })

  describe('deepCloneBlock', () => {
    it('should create independent copy', () => {
      const block: Block = { type: 'hero', visibility: { stock_min: 5 } }
      const clone = deepCloneBlock(block)
      expect(clone).toEqual(block)
      expect(clone).not.toBe(block)
      expect(clone.visibility).not.toBe(block.visibility)
    })

    it('should not affect original on modification', () => {
      const block: Block = { type: 'hero', visibility: {} }
      const clone = deepCloneBlock(block)
      ;(clone as any).text = 'Modified'
      expect((block as any).text).toBeUndefined()
    })
  })
})

describe('sanitizeBlocksForAPI', () => {
  it('should keep standard props', () => {
    const blocks: Block[] = [{ type: 'hero', visibility: {}, text: 'Titre', image: '/img.jpg' }]
    const result = sanitizeBlocksForAPI(blocks)
    expect(result[0].type).toBe('hero')
    expect(result[0].text).toBe('Titre')
    expect(result[0].image).toBe('/img.jpg')
  })

  it('should always include type and visibility', () => {
    const blocks: Block[] = [{ type: 'buy_button', visibility: { stock_min: 1 } }]
    const result = sanitizeBlocksForAPI(blocks)
    expect(result[0].type).toBe('buy_button')
    expect(result[0].visibility).toEqual({ stock_min: 1 })
  })

  it('should remove invalid tracking', () => {
    const blocks: Block[] = [{ type: 'hero', visibility: {}, tracking: 'invalid' as any }]
    const result = sanitizeBlocksForAPI(blocks)
    expect(result[0].tracking).toBeUndefined()
  })

  it('should keep valid tracking object', () => {
    const blocks: Block[] = [{ type: 'hero', visibility: {}, tracking: { event: 'view_hero' } }]
    const result = sanitizeBlocksForAPI(blocks)
    expect(result[0].tracking).toEqual({ event: 'view_hero' })
  })

  it('should handle multiple blocks', () => {
    const blocks: Block[] = [
      { type: 'hero', visibility: {}, text: 'Titre' },
      { type: 'buy_button', visibility: {}, label: 'Acheter' },
    ]
    const result = sanitizeBlocksForAPI(blocks)
    expect(result).toHaveLength(2)
    expect(result[1].label).toBe('Acheter')
  })
})

describe('BUILDER_TEMPLATES', () => {
  it('should have at least 5 templates', () => {
    expect(BUILDER_TEMPLATES.length).toBeGreaterThanOrEqual(5)
  })

  it('each template should have id, name, description and blocks', () => {
    BUILDER_TEMPLATES.forEach((t) => {
      expect(t.id).toBeTruthy()
      expect(t.name).toBeTruthy()
      expect(t.description).toBeTruthy()
      expect(Array.isArray(t.blocks)).toBe(true)
      expect(t.blocks.length).toBeGreaterThan(0)
    })
  })

  it('template_conversion should include countdown and social_proof', () => {
    const t = BUILDER_TEMPLATES.find((t) => t.id === 'template_conversion')
    expect(t).toBeDefined()
    const types = t!.blocks.map((b) => b.type)
    expect(types).toContain('countdown')
    expect(types).toContain('social_proof')
  })

  it('template_formation should include video_embed and pricing_table', () => {
    const t = BUILDER_TEMPLATES.find((t) => t.id === 'template_formation')
    expect(t).toBeDefined()
    const types = t!.blocks.map((b) => b.type)
    expect(types).toContain('video_embed')
    expect(types).toContain('pricing_table')
  })

  it('all template blocks should be valid', () => {
    BUILDER_TEMPLATES.forEach((template) => {
      template.blocks.forEach((block) => {
        const result = validateBlock(block)
        expect(result.valid).toBe(true)
      })
    })
  })
})

describe('createDefaultPageSettings', () => {
  it('should return default white background', () => {
    const settings = createDefaultPageSettings()
    expect(settings.background_color).toBe('#ffffff')
    expect(settings.background_type).toBe('color')
  })

  it('should return empty SEO fields', () => {
    const settings = createDefaultPageSettings()
    expect(settings.seo_title).toBe('')
    expect(settings.seo_description).toBe('')
    expect(settings.seo_og_image).toBe('')
  })
})

describe('sanitizePageSettings', () => {
  it('should keep non-empty fields', () => {
    const settings = {
      background_color: '#ff0000',
      background_type: 'color' as const,
      seo_title: 'Mon produit',
      seo_description: 'Description',
      seo_og_image: 'https://example.com/og.jpg',
    }
    const result = sanitizePageSettings(settings)
    expect(result.background_color).toBe('#ff0000')
    expect(result.seo_title).toBe('Mon produit')
    expect(result.seo_og_image).toBe('https://example.com/og.jpg')
  })

  it('should omit empty/undefined fields', () => {
    const settings = {
      background_color: '#ffffff',
      background_type: 'color' as const,
      seo_title: '',
      seo_description: undefined,
    }
    const result = sanitizePageSettings(settings)
    expect(result.seo_title).toBeUndefined()
    expect(result.seo_description).toBeUndefined()
  })
})

describe('buildPageBackgroundStyle', () => {
  it('should return empty object for undefined settings', () => {
    expect(buildPageBackgroundStyle(undefined)).toEqual({})
  })

  it('should return backgroundColor for color type', () => {
    const style = buildPageBackgroundStyle({ background_color: '#ff0000', background_type: 'color' })
    expect(style.backgroundColor).toBe('#ff0000')
  })

  it('should return background for gradient type', () => {
    const gradient = 'linear-gradient(135deg,#667eea,#764ba2)'
    const style = buildPageBackgroundStyle({ background_color: gradient, background_type: 'gradient' })
    expect(style.background).toBe(gradient)
  })

  it('should return backgroundImage for image type', () => {
    const style = buildPageBackgroundStyle({
      background_type: 'image',
      background_image: 'https://example.com/bg.jpg',
    })
    expect(style.backgroundImage).toBe('url(https://example.com/bg.jpg)')
    expect(style.backgroundSize).toBe('cover')
  })

  it('should fallback to backgroundColor if no type specified', () => {
    const style = buildPageBackgroundStyle({ background_color: '#f0f0f0' })
    expect(style.backgroundColor).toBe('#f0f0f0')
  })
})

describe('createEmptyBlock — countdown configurable', () => {
  it('should create countdown with endDate 24h in the future', () => {
    const block = createEmptyBlock('countdown')
    expect(block.endDate).toBeDefined()
    const endDate = new Date(block.endDate as string)
    const diff = endDate.getTime() - Date.now()
    // Entre 23h et 25h dans le futur
    expect(diff).toBeGreaterThan(23 * 3600 * 1000)
    expect(diff).toBeLessThan(25 * 3600 * 1000)
  })

  it('should create countdown with data.seconds_remaining ~24h', () => {
    const block = createEmptyBlock('countdown')
    const data = block.data as { seconds_remaining: number }
    expect(data.seconds_remaining).toBeGreaterThan(23 * 3600)
    expect(data.seconds_remaining).toBeLessThanOrEqual(24 * 3600)
  })
})
