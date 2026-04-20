'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Dashboard - ThemeEditor
// Color picker + live preview des variables CSS
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '../pages/productService'
import { applyThemeVariables } from '@/src/lib/utils'
import { toast } from '@/src/components/ui/Toast'
import type { Theme, ThemeVariables } from '@/src/types'

const THEME_FIELDS: { key: keyof ThemeVariables; label: string; type: 'color' | 'text'; placeholder?: string }[] = [
  { key: 'primary_color',    label: 'Couleur principale',   type: 'color' },
  { key: 'secondary_color',  label: 'Couleur secondaire',   type: 'color' },
  { key: 'background_color', label: 'Fond de page',         type: 'color' },
  { key: 'button_color',     label: 'Couleur des boutons',  type: 'color' },
  { key: 'text_color',       label: 'Couleur du texte',     type: 'color' },
  { key: 'font_family',      label: 'Police',               type: 'text', placeholder: 'Inter, sans-serif' },
  { key: 'font_size_base',   label: 'Taille de base',       type: 'text', placeholder: '16px' },
  { key: 'border_radius',    label: 'Arrondi des coins',    type: 'text', placeholder: '8px' },
  { key: 'spacing_unit',     label: 'Unité d\'espacement',  type: 'text', placeholder: '8px' },
]

const DEFAULTS: ThemeVariables = {
  primary_color: '#FF6B35', secondary_color: '#2C3E50',
  background_color: '#FFFFFF', button_color: '#FF6B35',
  text_color: '#1a1a1a', font_family: 'Inter, sans-serif',
  font_size_base: '16px', border_radius: '8px', spacing_unit: '8px',
}

interface Props { theme: Theme }

export default function ThemeEditor({ theme }: Props) {
  const qc = useQueryClient()
  const [vars, setVars] = useState<ThemeVariables>({ ...DEFAULTS, ...theme.variables })

  // Live preview — applique les variables en temps réel sur :root
  useEffect(() => {
    applyThemeVariables(vars as Record<string, string>)
  }, [vars])

  const mutation = useMutation({
    mutationFn: () => productService.updateTheme(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['theme'] })
      toast('Thème sauvegardé')
    },
    onError: () => toast('Erreur lors de la sauvegarde', 'error'),
  })

  const reset = () => {
    setVars(DEFAULTS)
    toast('Thème réinitialisé', 'info')
  }

  return (
    <div className="space-y-6">
      {/* Champs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {THEME_FIELDS.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center gap-2">
              {type === 'color' && (
                <input
                  type="color"
                  value={(vars[key] as string) || '#000000'}
                  onChange={(e) => setVars((v) => ({ ...v, [key]: e.target.value }))}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                  aria-label={`Couleur ${label}`}
                />
              )}
              <input
                type="text"
                value={(vars[key] as string) || ''}
                onChange={(e) => setVars((v) => ({ ...v, [key]: e.target.value }))}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-theme text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Preview live */}
      <div className="border border-gray-200 rounded-theme p-4 bg-gray-50">
        <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Aperçu en direct</p>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            style={{ backgroundColor: vars.primary_color, borderRadius: vars.border_radius, fontFamily: vars.font_family }}
            className="px-6 py-2 text-white font-bold text-sm shadow"
          >
            Acheter maintenant
          </button>
          <span style={{ color: vars.primary_color, fontFamily: vars.font_family }} className="font-bold text-xl">97,00 €</span>
          <span style={{ color: vars.secondary_color, fontFamily: vars.font_family }} className="text-sm">Texte secondaire</span>
        </div>
      </div>

      {/* CSS généré */}
      <details className="text-xs">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium">Voir le CSS généré</summary>
        <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded-theme overflow-x-auto text-xs">
          {`:root {\n${Object.entries(vars).map(([k, v]) => `  --${k.replace(/_/g, '-')}: ${v};`).join('\n')}\n}`}
        </pre>
      </details>

      <div className="flex gap-3">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex-1 py-2.5 bg-primary text-white font-bold rounded-theme hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? 'Sauvegarde…' : 'Sauvegarder le thème'}
        </button>
        <button onClick={reset} className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-theme hover:bg-gray-50 text-sm">
          Réinitialiser
        </button>
      </div>
    </div>
  )
}
