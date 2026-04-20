'use client'
export const dynamic = 'force-dynamic'
// Auteur : Gilles - Projet : AGC Space - Module : Dashboard Affilié + Vendeur
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/src/modules/auth/store/authStore'
import { affiliationDashService } from '@/src/modules/affiliation/service/affiliationDashService'
import VendeurCommissionsPanel from '@/src/modules/dashboard/components/VendeurCommissionsPanel'
import { toast } from '@/src/components/ui/Toast'
import { formatPrice } from '@/src/lib/utils'
import type { MarketplaceProduct } from '@/src/modules/affiliation/service/affiliationDashService'

export default function AffiliationsPage() {
  const { user, hasRole } = useAuthStore()
  const isVendeur = hasRole('ecommercant')
  const isAffilie = hasRole('affilie')
  const qc = useQueryClient()
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'affilie' | 'vendeur'>(
    isAffilie ? 'affilie' : 'vendeur'
  )

  const { data: stats } = useQuery({
    queryKey: ['affiliation-stats'],
    queryFn: affiliationDashService.getStats,
    enabled: isAffilie,
  })

  const { data: marketplace = [], isLoading: marketLoading } = useQuery({
    queryKey: ['affiliation-marketplace'],
    queryFn: affiliationDashService.getMarketplace,
  })

  const { data: commissions = [] } = useQuery({
    queryKey: ['commissions'],
    queryFn: affiliationDashService.getCommissions,
  })

  const createLinkMutation = useMutation({
    mutationFn: ({ productId }: { productId: number }) =>
      affiliationDashService.createLink(productId, '0.1500'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['affiliation-marketplace'] })
      qc.invalidateQueries({ queryKey: ['affiliation-stats'] })
      toast('Lien créé avec succès')
    },
    onError: () => toast('Erreur lors de la création du lien', 'error'),
  })

  const handleGenerateLink = async (product: MarketplaceProduct) => {
    if (product.my_link) {
      // Copier l'URL signée
      try {
        const links = await affiliationDashService.getLinks()
        const link = links.find((l) => l.tracking_code === product.my_link?.tracking_code)
        if (link) {
          const signed = await affiliationDashService.generateSignedUrl(link.id)
          await navigator.clipboard.writeText(signed.url)
          setCopiedId(product.id)
          toast('Lien copié dans le presse-papier !')
          setTimeout(() => setCopiedId(null), 2000)
        }
      } catch {
        toast('Erreur lors de la copie', 'error')
      }
    } else {
      createLinkMutation.mutate({ productId: product.id })
    }
  }

  const STAT_CARDS = [
    {
      icon: 'payments', label: 'Commissions Totales',
      value: formatPrice(stats?.total_earned ?? '0'),
      sub: '+12% ce mois', subColor: 'text-green-600',
      progress: true,
    },
    {
      icon: 'ads_click', label: 'Clics Totaux',
      value: (stats?.total_orders_generated ?? 0).toLocaleString('fr-FR'),
      sub: 'Volume en hausse', subColor: 'text-green-600',
      progress: false,
    },
    {
      icon: 'percent', label: 'Taux de Conversion',
      value: `${stats?.conversion_rate ?? 0}%`,
      sub: 'Supérieur à la moyenne', subColor: 'text-slate-500',
      progress: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex justify-between items-end mb-8 px-8 pt-8">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-primary-container font-headline">
            Centre d&apos;Affiliation
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">
            Gérez vos performances et maximisez vos revenus orbitaux.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold">{user?.username ?? 'Partenaire'}</p>
            <p className="text-xs text-secondary">Niveau : Galaxie</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary">person</span>
          </div>
        </div>
      </header>

      {/* ── Onglets Affilié / Vendeur ──────────────────────────────────── */}
      {isAffilie && isVendeur && (
        <div className="px-8 mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('affilie')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'affilie'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Vue Affilié
          </button>
          <button
            onClick={() => setActiveTab('vendeur')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'vendeur'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Gestion Vendeur
          </button>
        </div>
      )}

      {/* ── Vue Vendeur ────────────────────────────────────────────────── */}
      {isVendeur && (!isAffilie || activeTab === 'vendeur') && (
        <div className="px-8 pb-12">
          <VendeurCommissionsPanel />
        </div>
      )}

      {/* ── Vue Affilié ────────────────────────────────────────────────── */}
      {isAffilie && (!isVendeur || activeTab === 'affilie') && (
        <>

      {/* ── Stats Bento ────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 px-8">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="glass-card p-8 rounded-xl border border-white/20 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-secondary">{card.icon}</span>
                {card.sub && <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{card.sub}</span>}
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
              <h3 className="text-3xl font-black text-primary font-headline">{card.value}</h3>
            </div>
            {card.progress && (
              <div className="h-1 w-full bg-surface-container mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-3/4" />
              </div>
            )}
          </div>
        ))}

        {/* Paiement en attente — carte sombre */}
        <div className="bg-primary-container p-8 rounded-xl shadow-xl shadow-black/10 flex flex-col justify-between text-white">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-secondary-container">pending_actions</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Paiement en attente</p>
            <h3 className="text-3xl font-black font-headline">{formatPrice(stats?.pending_amount ?? '0')}</h3>
          </div>
          <button className="text-xs font-bold text-secondary-container flex items-center gap-2 mt-4 hover:opacity-80 transition-opacity">
            DÉTAILS DU RETRAIT
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* ── Marketplace ────────────────────────────────────────────────── */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden mx-8 mb-12">
        <div className="px-8 py-6 border-b border-surface-container flex justify-between items-center bg-white">
          <h3 className="text-xl font-bold text-primary-container font-headline">
            Produits d&apos;Affiliation Disponibles
          </h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-xs font-bold text-slate-500 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
              Filtres
            </button>
            <button className="px-4 py-2 text-xs font-bold text-slate-500 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
              Exporter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50 border-b border-surface-container">
              <tr>
                {['Nom du Produit', 'Catégorie', '% Commission', 'Action'].map((h) => (
                  <th key={h} className={`px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 ${h === 'Action' ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {marketLoading ? (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 text-sm">Chargement…</td></tr>
              ) : marketplace.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 text-sm">Aucun produit disponible pour l&apos;instant.</td></tr>
              ) : (
                marketplace.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary text-sm">inventory_2</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-primary">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.is_digital ? 'Logiciel / Numérique' : 'Produit Physique'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.is_digital ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-slate-200 text-slate-600'}`}>
                        {product.category || (product.is_digital ? 'Numérique' : 'Physique')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-secondary">
                        {product.my_link?.commission_display ?? '15%'}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleGenerateLink(product)}
                        disabled={createLinkMutation.isPending}
                        className="px-5 py-2 bg-surface-container-highest text-primary-container rounded-lg text-xs font-bold group-hover:bg-secondary group-hover:text-white transition-all disabled:opacity-50"
                      >
                        {copiedId === product.id ? '✓ Copié !' : product.my_link ? 'Copier le Lien' : 'Générer Lien'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-4 bg-white flex justify-center">
          <button className="text-xs font-bold text-slate-400 hover:text-secondary flex items-center gap-2 transition-colors uppercase tracking-widest">
            Voir tous les produits
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      </section>

      {/* ── Commissions récentes ────────────────────────────────────────── */}
      {commissions.length > 0 && (
        <section className="px-8 mb-12">
          <h3 className="font-headline text-xl font-bold text-primary mb-6">Commissions Récentes</h3>
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low/50 text-xs text-slate-500 uppercase">
                <tr>
                  {['Produit', 'Montant', 'Taux', 'Statut', 'Date'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left font-black tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {commissions.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-medium">{c.product_name}</td>
                    <td className="px-6 py-4 font-black text-secondary">{formatPrice(c.amount)}</td>
                    <td className="px-6 py-4 text-slate-500">{c.commission_display}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'paid' ? 'bg-green-100 text-green-700' :
                        c.status === 'validated' ? 'bg-blue-100 text-blue-700' :
                        c.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="mt-12 px-8 pb-12 flex flex-col items-center gap-6 text-slate-400">
        <div className="flex gap-8">
          {['Conditions Générales', 'Confidentialité', 'Support', 'Documentation'].map((item) => (
            <a key={item} href="#" className="text-[10px] uppercase tracking-[0.2em] hover:text-secondary transition-colors">
              {item}
            </a>
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em]">© 2024 AGC Space. L&apos;Horizon Infini.</p>
      </footer>

        </> /* fin Vue Affilié */
      )}
    </div>
  )
}
