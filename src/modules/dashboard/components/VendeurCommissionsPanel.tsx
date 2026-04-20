'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Dashboard Vendeur - Panel Commissions
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendeurService } from '../pages/vendeurService'
import { toast } from '@/src/components/ui/Toast'
import { SkeletonTable } from '@/src/components/ui/Skeleton'
import EmptyState from '@/src/components/ui/EmptyState'
import { formatPrice } from '@/src/lib/utils'
import type { VendeurCommission } from '@/src/types'

const STATUS_CONFIG = {
  pending:   { label: 'En attente',  style: 'bg-yellow-100 text-yellow-700' },
  validated: { label: 'Validée',     style: 'bg-blue-100 text-blue-700' },
  paid:      { label: 'Versée',      style: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulée',     style: 'bg-red-100 text-red-700' },
} as const

type StatusKey = keyof typeof STATUS_CONFIG

export default function VendeurCommissionsPanel() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ['vendeur-commissions', statusFilter],
    queryFn: () => vendeurService.getCommissions(statusFilter || undefined),
  })

  const { data: affiliates = [] } = useQuery({
    queryKey: ['vendeur-affiliates'],
    queryFn: vendeurService.getAffiliates,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'validate' | 'cancel' }) =>
      vendeurService.updateCommission(id, action),
    onSuccess: (_, { action }) => {
      qc.invalidateQueries({ queryKey: ['vendeur-commissions'] })
      qc.invalidateQueries({ queryKey: ['vendeur-stats'] })
      toast(action === 'validate' ? 'Commission validée' : 'Commission annulée',
        action === 'validate' ? 'success' : 'info')
    },
    onError: () => toast('Erreur lors de la mise à jour', 'error'),
  })

  const totalPending = commissions
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + Number(c.amount), 0)

  const totalValidated = commissions
    .filter((c) => c.status === 'validated')
    .reduce((sum, c) => sum + Number(c.amount), 0)

  return (
    <div className="space-y-8">
      {/* ── Stats rapides ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon="groups"
          label="Affiliés actifs"
          value={affiliates.filter((a) => a.is_active).length.toString()}
          sub={`${affiliates.length} au total`}
        />
        <StatCard
          icon="pending_actions"
          label="Commissions en attente"
          value={formatPrice(totalPending)}
          sub={`${commissions.filter((c) => c.status === 'pending').length} commission(s)`}
          highlight
        />
        <StatCard
          icon="check_circle"
          label="Commissions validées"
          value={formatPrice(totalValidated)}
          sub={`${commissions.filter((c) => c.status === 'validated').length} à verser`}
        />
      </div>

      {/* ── Affiliés ──────────────────────────────────────────────────── */}
      {affiliates.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Mes affiliés</h3>
          <div className="bg-white rounded-theme shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Affilié', 'Produit', 'Taux', 'Clics', 'Commissions', 'Gains versés', 'En attente'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {affiliates.map((aff) => (
                  <tr key={aff.link_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{aff.affiliate_username}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{aff.product_name}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{aff.commission_display}</td>
                    <td className="px-4 py-3 text-gray-600">{aff.clicks_count.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-gray-600">{aff.total_commissions}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatPrice(aff.total_earned)}</td>
                    <td className="px-4 py-3 text-yellow-600 font-medium">{formatPrice(aff.pending_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Commissions ───────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Commissions</h3>
          <div className="flex gap-2">
            {(['', 'pending', 'validated', 'paid', 'cancelled'] as const).map((s) => (
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
        </div>

        {isLoading ? (
          <SkeletonTable rows={4} />
        ) : commissions.length === 0 ? (
          <EmptyState
            icon="💸"
            title="Aucune commission"
            description="Les commissions de vos affiliés apparaîtront ici."
          />
        ) : (
          <div className="bg-white rounded-theme shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Commande', 'Produit', 'Affilié', 'Montant', 'Taux', 'Statut', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commissions.map((c) => (
                  <CommissionRow
                    key={c.id}
                    commission={c}
                    onValidate={() => updateMutation.mutate({ id: c.id, action: 'validate' })}
                    onCancel={() => updateMutation.mutate({ id: c.id, action: 'cancel' })}
                    isPending={updateMutation.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

// ── Ligne commission ──────────────────────────────────────────────────────────

function CommissionRow({
  commission: c,
  onValidate,
  onCancel,
  isPending,
}: {
  commission: VendeurCommission
  onValidate: () => void
  onCancel: () => void
  isPending: boolean
}) {
  const cfg = STATUS_CONFIG[c.status as StatusKey] ?? STATUS_CONFIG.pending
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-gray-700">{c.order_number}</td>
      <td className="px-4 py-3 text-xs text-gray-600">{c.product_name}</td>
      <td className="px-4 py-3 font-medium">{c.affiliate_username}</td>
      <td className="px-4 py-3 font-bold text-primary">{formatPrice(c.amount)}</td>
      <td className="px-4 py-3 text-gray-500">{c.commission_display}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.style}`}>
          {cfg.label}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-400 text-xs">
        {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
      </td>
      <td className="px-4 py-3">
        {c.status === 'pending' && (
          <div className="flex gap-1">
            <button
              onClick={onValidate}
              disabled={isPending}
              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 disabled:opacity-50 transition-colors"
              title="Valider la commission"
            >
              ✓ Valider
            </button>
            <button
              onClick={onCancel}
              disabled={isPending}
              className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 disabled:opacity-50 transition-colors"
              title="Annuler la commission"
            >
              ✕ Annuler
            </button>
          </div>
        )}
        {c.status === 'validated' && (
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 disabled:opacity-50 transition-colors"
          >
            ✕ Annuler
          </button>
        )}
        {(c.status === 'paid' || c.status === 'cancelled') && (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>
    </tr>
  )
}

// ── Carte stat ────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, highlight = false,
}: {
  icon: string; label: string; value: string; sub: string; highlight?: boolean
}) {
  return (
    <div className={`p-6 rounded-theme shadow-sm ${highlight ? 'bg-primary-container text-white' : 'bg-white'}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className={`material-symbols-outlined ${highlight ? 'text-secondary-container' : 'text-secondary'}`}>
          {icon}
        </span>
        <p className={`text-xs font-bold uppercase tracking-wider ${highlight ? 'text-secondary-container' : 'text-gray-500'}`}>
          {label}
        </p>
      </div>
      <p className={`text-2xl font-black font-headline ${highlight ? 'text-white' : 'text-primary'}`}>
        {value}
      </p>
      <p className={`text-xs mt-1 ${highlight ? 'text-secondary-container' : 'text-gray-400'}`}>{sub}</p>
    </div>
  )
}
