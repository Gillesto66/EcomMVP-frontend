'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Dashboard - ProductForm
import { useState, useRef } from 'react'
import { cn } from '@/src/lib/utils'
import type { Product } from '@/src/types'

interface Props {
  initial?: Partial<Product>
  onSubmit: (data: FormData) => Promise<unknown>
  isLoading?: boolean
}

interface ImagePreview { file: File | null; url: string | null }

export default function ProductForm({ initial = {}, onSubmit, isLoading }: Props) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    description: initial.description ?? '',
    price: initial.price ?? '',
    sku: initial.sku ?? '',
    stock: initial.stock ?? 0,
    category: initial.category ?? '',
    is_digital: initial.is_digital ?? false,
    is_active: initial.is_active ?? true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [images, setImages] = useState<{ main: ImagePreview; sec1: ImagePreview; sec2: ImagePreview }>({
    main: { file: null, url: initial.image_main_url ?? null },
    sec1: { file: null, url: initial.image_secondary_1_url ?? null },
    sec2: { file: null, url: initial.image_secondary_2_url ?? null },
  })

  const mainRef = useRef<HTMLInputElement>(null)
  const sec1Ref = useRef<HTMLInputElement>(null)
  const sec2Ref = useRef<HTMLInputElement>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Le nom est requis'
    if (!form.price || isNaN(Number(form.price))) e.price = 'Prix invalide (ex: 97.00)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleImageChange = (key: 'main' | 'sec1' | 'sec2', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImages((prev) => ({ ...prev, [key]: { file, url: URL.createObjectURL(file) } }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) fd.append(k, String(v))
    })
    if (images.main.file) fd.append('image_main', images.main.file)
    if (images.sec1.file) fd.append('image_secondary_1', images.sec1.file)
    if (images.sec2.file) fd.append('image_secondary_2', images.sec2.file)
    await onSubmit(fd)
  }

  const CATEGORIES = ['Formation', 'SaaS', 'Technologie', 'Physique', 'Numérique', 'Service', 'Autre']

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
        <input type="text" required value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Ex: Formation Django REST Framework"
          className={cn('w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary', errors.name ? 'border-red-400' : 'border-gray-200')}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3} placeholder="Décrivez votre produit en quelques phrases…"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
        />
      </div>

      {/* Prix + Catégorie */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
          <input type="number" min="0" step="0.01" value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="97.00"
            className={cn('w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary', errors.price ? 'border-red-400' : 'border-gray-200')}
          />
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
          >
            <option value="">Choisir…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* SKU — optionnel avec explication */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SKU
          <span className="ml-2 text-xs font-normal text-gray-400">(optionnel — auto-généré si vide)</span>
        </label>
        <input type="text" value={form.sku}
          onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
          placeholder="Ex: FORM-DJG-001 (laissez vide pour auto-générer)"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary font-mono"
        />
        <p className="text-xs text-gray-400 mt-1">
          Le SKU (Stock Keeping Unit) est un code unique qui identifie votre produit dans votre catalogue.
        </p>
      </div>

      {/* Stock + Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input type="number" min="0" value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div className="flex flex-col gap-3 pt-6">
          {([['is_digital', 'Produit numérique'], ['is_active', 'Actif']] as const).map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={Boolean(form[k])}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.checked }))}
                className="w-4 h-4 text-secondary rounded"
              />
              <span className="text-sm text-gray-700">{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Images du produit</p>
        <div className="grid grid-cols-3 gap-3">
          {([
            { key: 'main' as const, label: 'Principale', ref: mainRef, required: false },
            { key: 'sec1' as const, label: 'Secondaire 1', ref: sec1Ref, required: false },
            { key: 'sec2' as const, label: 'Secondaire 2', ref: sec2Ref, required: false },
          ]).map(({ key, label, ref }) => (
            <div key={key}>
              <p className="text-xs text-gray-500 mb-1 text-center">{label}</p>
              <button type="button" onClick={() => ref.current?.click()}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-secondary transition-colors overflow-hidden flex items-center justify-center bg-gray-50 group"
              >
                {images[key].url ? (
                  <img src={images[key].url!} alt={label} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-300 group-hover:text-secondary transition-colors">
                    <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                    <span className="text-[10px]">Ajouter</span>
                  </div>
                )}
              </button>
              <input ref={ref} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleImageChange(key, e)}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Formats acceptés : JPG, PNG, WebP. Max 5 Mo par image.</p>
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full py-3 bg-primary-container text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isLoading ? 'Enregistrement…' : 'Enregistrer le produit'}
      </button>
    </form>
  )
}
