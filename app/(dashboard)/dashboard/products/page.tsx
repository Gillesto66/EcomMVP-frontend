'use client'
export const dynamic = 'force-dynamic'
// Auteur : Gilles - Projet : AGC Space - Module : Dashboard - Liste Produits
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import apiClient from '@/src/lib/api'
import { productService } from '@/src/modules/dashboard/pages/productService'
import { SkeletonTable } from '@/src/components/ui/Skeleton'
import EmptyState from '@/src/components/ui/EmptyState'
import Modal from '@/src/components/ui/Modal'
import ProductForm from '@/src/modules/dashboard/components/ProductForm'
import { toast } from '@/src/components/ui/Toast'
import { formatPrice } from '@/src/lib/utils'
import type { Product } from '@/src/types'

export default function ProductsPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.list,
  })

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => apiClient.post<Product>('/products/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      setShowCreate(false)
      toast(`Produit "${p.name}" créé`)
    },
    onError: () => toast('Erreur lors de la création', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: number; fd: FormData }) =>
      apiClient.patch<Product>(`/products/${id}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      setEditProduct(null)
      toast(`Produit "${p.name}" mis à jour`)
    },
    onError: () => toast('Erreur lors de la mise à jour', 'error'),
  })

  const STATUS_BADGE = (active: boolean) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {active ? 'Actif' : 'Inactif'}
    </span>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mes produits</h1>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary text-white font-medium rounded-theme hover:opacity-90 text-sm">
          + Nouveau produit
        </button>
      </div>

      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Aucun produit"
          description="Créez votre premier produit pour commencer à vendre."
          action={<button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary text-white rounded-theme text-sm font-medium">Créer un produit</button>}
        />
      ) : (
        <div className="bg-white rounded-theme shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {['Nom', 'SKU', 'Prix', 'Stock', 'Type', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-6 py-4 font-bold text-primary">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4 text-gray-600">{p.is_digital ? '∞' : p.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_digital ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {p.is_digital ? 'Numérique' : 'Physique'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{STATUS_BADGE(p.is_active)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setEditProduct(p)} className="text-primary hover:underline text-xs font-medium">Modifier</button>
                      <button onClick={() => router.push(`/dashboard/builder/${p.id}`)} className="text-gray-500 hover:text-gray-700 text-xs font-medium">Builder</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouveau produit" size="lg">
        <ProductForm
          onSubmit={(fd) => createMutation.mutateAsync(fd)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Modifier le produit" size="lg">
        {editProduct && (
          <ProductForm
            initial={editProduct}
            onSubmit={(fd) => updateMutation.mutateAsync({ id: editProduct.id, fd })}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  )
}
