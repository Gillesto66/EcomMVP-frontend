'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Builder - PageSettingsPanel
// Panneau de configuration globale de la page : background + SEO
import type { PageSettings } from '@/src/types'
import { builderLogger } from '@/src/modules/builder/logger'

const GRADIENT_PRESETS = [
  { label: 'Blanc', value: '#ffffff', type: 'color' as const },
  { label: 'Gris clair', value: '#f8fafc', type: 'color' as const },
  { label: 'Sombre', value: '#0f172a', type: 'color' as const },
  { label: 'Violet', value: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', type: 'gradient' as const },
  { label: 'Aurore', value: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)', type: 'gradient' as const },
  { label: 'Océan', value: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)', type: 'gradient' as const },
  { label: 'Forêt', value: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)', type: 'gradient' as const },
  { label: 'Coucher', value: 'linear-gradient(135deg,#fa709a 0%,#fee140 100%)', type: 'gradient' as const },
]

interface Props {
  settings: PageSettings
  productName?: string
  onChange: (settings: PageSettings) => void
}

export default function PageSettingsPanel({ settings, productName, onChange }: Props) {
  const handleChange = (updates: Partial<PageSettings>) => {
    const next = { ...settings, ...updates }
    onChange(next)
    builderLogger.info({
      component: 'PageSettingsPanel',
      action: 'settingsChanged',
      value: Object.keys(updates),
    })
  }

  const applyPreset = (preset: typeof GRADIENT_PRESETS[0]) => {
    handleChange({
      background_color: preset.value,
      background_type: preset.type,
    })
    builderLogger.info({
      component: 'PageSettingsPanel',
      action: 'presetApplied',
      value: preset.label,
    })
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 w-72 shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">⚙️ Paramètres de la page</h3>
        <p className="text-xs text-gray-500 mt-0.5">Background global et SEO</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* ── Background ──────────────────────────────────────────────── */}
        <section>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🎨</span> Fond de page
          </h4>

          {/* Présets */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                title={preset.label}
                className="group relative h-10 rounded-lg border-2 border-transparent hover:border-blue-400 transition-all overflow-hidden"
                style={{
                  background: preset.value,
                  borderColor: settings.background_color === preset.value ? '#3b82f6' : undefined,
                }}
              >
                <span className="absolute inset-0 flex items-end justify-center pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-bold text-white drop-shadow bg-black/40 px-1 rounded">
                    {preset.label}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Type de fond */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <div className="flex gap-2">
              {(['color', 'gradient', 'image'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleChange({ background_type: t })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                    settings.background_type === t
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {t === 'color' ? 'Couleur' : t === 'gradient' ? 'Dégradé' : 'Image'}
                </button>
              ))}
            </div>
          </div>

          {/* Couleur / gradient */}
          {(settings.background_type === 'color' || settings.background_type === 'gradient') && (
            <div className="mb-3">
              <label htmlFor="page-bg-color" className="block text-xs font-medium text-gray-600 mb-1">
                {settings.background_type === 'gradient' ? 'CSS gradient' : 'Couleur'}
              </label>
              {settings.background_type === 'color' ? (
                <div className="flex gap-2 items-center">
                  <input
                    id="page-bg-color"
                    type="color"
                    value={settings.background_color?.startsWith('#') ? settings.background_color : '#ffffff'}
                    onChange={(e) => handleChange({ background_color: e.target.value, background_type: 'color' })}
                    className="h-9 w-12 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.background_color || '#ffffff'}
                    onChange={(e) => handleChange({ background_color: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded font-mono"
                    placeholder="#ffffff"
                  />
                </div>
              ) : (
                <textarea
                  id="page-bg-color"
                  value={settings.background_color || ''}
                  onChange={(e) => handleChange({ background_color: e.target.value })}
                  rows={2}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded font-mono"
                  placeholder="linear-gradient(135deg,#667eea 0%,#764ba2 100%)"
                />
              )}
            </div>
          )}

          {/* Image de fond */}
          {settings.background_type === 'image' && (
            <div className="mb-3">
              <label htmlFor="page-bg-image" className="block text-xs font-medium text-gray-600 mb-1">
                URL de l'image
              </label>
              <input
                id="page-bg-image"
                type="url"
                value={settings.background_image || ''}
                onChange={(e) => handleChange({ background_image: e.target.value })}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                placeholder="https://exemple.com/bg.jpg"
              />
            </div>
          )}

          {/* Aperçu du fond */}
          <div
            className="h-12 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-400"
            style={
              settings.background_type === 'gradient'
                ? { background: settings.background_color }
                : settings.background_type === 'image' && settings.background_image
                ? { backgroundImage: `url(${settings.background_image})`, backgroundSize: 'cover' }
                : { backgroundColor: settings.background_color || '#ffffff' }
            }
          >
            <span className="bg-white/70 px-2 py-0.5 rounded text-gray-600">Aperçu</span>
          </div>
        </section>

        {/* ── SEO ─────────────────────────────────────────────────────── */}
        <section>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🔍</span> SEO
          </h4>

          <div className="space-y-3">
            <div>
              <label htmlFor="seo-title" className="block text-xs font-medium text-gray-600 mb-1">
                Titre de la page
                <span className="text-gray-400 ml-1 font-normal">(balise &lt;title&gt;)</span>
              </label>
              <input
                id="seo-title"
                type="text"
                value={settings.seo_title || ''}
                onChange={(e) => handleChange({ seo_title: e.target.value })}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                placeholder={productName || 'Titre SEO de la page'}
                maxLength={70}
              />
              <p className="text-[10px] text-gray-400 mt-0.5">
                {(settings.seo_title || '').length}/70 caractères
              </p>
            </div>

            <div>
              <label htmlFor="seo-description" className="block text-xs font-medium text-gray-600 mb-1">
                Meta description
              </label>
              <textarea
                id="seo-description"
                value={settings.seo_description || ''}
                onChange={(e) => handleChange({ seo_description: e.target.value })}
                rows={3}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded resize-none"
                placeholder="Description courte pour les moteurs de recherche…"
                maxLength={160}
              />
              <p className="text-[10px] text-gray-400 mt-0.5">
                {(settings.seo_description || '').length}/160 caractères
              </p>
            </div>

            <div>
              <label htmlFor="seo-og-image" className="block text-xs font-medium text-gray-600 mb-1">
                Image Open Graph
                <span className="text-gray-400 ml-1 font-normal">(partage réseaux sociaux)</span>
              </label>
              <input
                id="seo-og-image"
                type="url"
                value={settings.seo_og_image || ''}
                onChange={(e) => handleChange({ seo_og_image: e.target.value })}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                placeholder="https://exemple.com/og-image.jpg"
              />
            </div>

            {/* Aperçu SERP */}
            {(settings.seo_title || settings.seo_description) && (
              <div className="border border-gray-200 rounded p-3 bg-gray-50">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Aperçu Google</p>
                <p className="text-sm text-blue-600 font-medium truncate">
                  {settings.seo_title || productName || 'Titre de la page'}
                </p>
                <p className="text-xs text-green-700 truncate">agcspace.com/shop/…</p>
                <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                  {settings.seo_description || 'Description de la page…'}
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
