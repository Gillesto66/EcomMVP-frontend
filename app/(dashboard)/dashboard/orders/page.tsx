'use client'
export const dynamic = 'force-dynamic'
// Auteur : Gilles - Projet : AGC Space - Module : Dashboard - Commandes
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/src/modules/auth/store/authStore'
import { vendeurService } from '@/src/modules/dashboard/pages/vendeurService'
import apiClient from '@/src/lib/api'
import { SkeletonTable } from '@/src/components/ui/Skeleton'
import EmptyState from '@/src/components/ui/EmptyState'
import { formatPrice } from '@/src/lib/utils'
import type { Order, VendeurOrder } from '@/src/types'

const STATUS_CONFIG = {
  pending:   { label: 'En attente', style: 'bg-yellow-100 text-yellow-700' },
  paid:      { label: 'Payée',      style: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulée',    style: 'bg-red-100 text-red-700' },
  refunded:  { label: 'Remboursée', style: 'bg-gray-100 text-gray-600' },
} as const

type StatusKey = keyof typeof STATUS_CONFIG

export default function OrdersPage() {
  const { hasRole } = useAuthStore()
  const isVendeur = hasRole('ecommercant')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // ── Vue client ────────────────────────────────────────────────────────────
  const { data: clientOrders = [], isLoading: clientLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ results?: Order[]; count?: number } | Order[]>('/orders/')
      if (Array.isArray(data)) return data
      return (data as { results?: Order[] }).results ?? []
    },
    enabled: !isVendeur,
  })

  // ── Vue vendeur ───────────────────────────────────────────────────────────
  const { data: vendeurOrders = [], isLoading: vendeurLoading } = useQuery({
    queryKey: ['vendeur-orders', statusFilter],
    queryFn: () => vendeurService.getOrders(statusFilter || undefined),
    enabled: isVendeur,
  })

  const isLoading = isVendeur ? vendeurLoading : clientLoading

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isVendeur ? 'Commandes de mes produits' : 'Mes commandes'}
          </h1>
          {isVendeur && (
            <p className="text-sm text-gray-500 mt-1">
              Toutes les commandes contenant vos produits
            </p>
          )}
        </div>

        {/* Filtre statut — vendeur uniquement */}
        {isVendeur && (
          <div className="flex gap-2">
            {(['', 'pending', 'paid', 'cancelled', 'refunded'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s === '' ? 'Toutes' : STATUS_CONFIG[s as StatusKey]?.label ?? s}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : (isVendeur ? vendeurOrders : clientOrders).length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Aucune commande"
          description={
            isVendeur
              ? 'Les commandes de vos produits apparaîtront ici.'
              : 'Vos commandes apparaîtront ici après votre premier achat.'
          }
          action={
            !isVendeur ? (
              <a href="/shop" className="px-4 py-2 bg-primary text-white rounded-theme text-sm font-medium">
                Découvrir les produits
              </a>
            ) : undefined
          }
        />
      ) : isVendeur ? (
        <VendeurOrdersTable orders={vendeurOrders} />
      ) : (
        <ClientOrdersTable orders={clientOrders} />
      )}
    </div>
  )
}

// ── Table commandes client ────────────────────────────────────────────────────

function ClientOrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-white rounded-theme shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            {['N° Commande', 'Date', 'Articles', 'Total', 'Statut', 'Commission'].map((h) => (
              <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status as StatusKey] ?? STATUS_CONFIG.pending
            return (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-gray-700 font-semibold">
                  {order.order_number || `#${order.id}`}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4">
                  <ul className="space-y-0.5">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-xs text-gray-600">
                        {item.quantity}× {item.product_name}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 font-bold text-primary">{formatPrice(order.total)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.style}`}>
                    {cfg.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {order.commission ? (
                    <span className="text-green-600 font-medium text-xs">
                      +{formatPrice(order.commission.amount)}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Table commandes vendeur ───────────────────────────────────────────────────

function VendeurOrdersTable({ orders }: { orders: VendeurOrder[] }) {
  return (
    <div className="bg-white rounded-theme shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            {['N° Commande', 'Client', 'Date', 'Articles', 'Total', 'Statut', 'Commission'].map((h) => (
              <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status as StatusKey] ?? STATUS_CONFIG.pending
            return (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-gray-700 font-semibold">
                  {order.order_number}
                </td>
                <td className="px-6 py-4 text-gray-600 text-xs">{order.customer_username}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4">
                  <ul className="space-y-0.5">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-xs text-gray-600">
                        {item.quantity}× {item.product_name}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 font-bold text-primary">{formatPrice(order.total)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.style}`}>
                    {cfg.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {order.commission ? (
                    <div className="text-xs">
                      <span className="text-green-600 font-medium">
                        +{formatPrice(order.commission.amount)}
                      </span>
                      <span className="text-gray-400 ml-1">({order.commission.affiliate})</span>
                    </div>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
