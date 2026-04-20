'use client'
export const dynamic = 'force-dynamic'
// Auteur : Gilles - Projet : AGC Space - Module : Dashboard — adapté par rôle
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/src/modules/auth/store/authStore'
import { vendeurService } from '@/src/modules/dashboard/pages/vendeurService'
import apiClient from '@/src/lib/api'
import { SkeletonCard, SkeletonTable } from '@/src/components/ui/Skeleton'
import { formatPrice } from '@/src/lib/utils'
import type { Product, Order } from '@/src/types'

const STATUS_CONFIG = {
  pending:   { label: 'En attente', style: 'bg-yellow-100 text-yellow-700' },
  paid:      { label: 'Payée',      style: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulée',    style: 'bg-red-100 text-red-700' },
  refunded:  { label: 'Remboursée', style: 'bg-gray-100 text-gray-600' },
} as const

export default function DashboardPage() {
  const { user, hasRole } = useAuthStore()
  const router = useRouter()

  const isVendeur  = hasRole('ecommercant')
  const isAffilie  = hasRole('affilie')
  const isClient   = hasRole('client')

  if (!user) { router.push('/login'); return null }

  if (isAffilie && !isVendeur) {
    router.push('/dashboard/affiliations')
    return null
  }

  if (isClient && !isVendeur && !isAffilie) {
    return <ClientDashboard username={user.username} />
  }

  return <VendeurDashboard username={user.username} />
}

// ── Vue Client ────────────────────────────────────────────────────────────────

function ClientDashboard({ username }: { username: string }) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ results?: Order[] } | Order[]>('/orders/')
      if (Array.isArray(data)) return data
      return (data as { results?: Order[] }).results ?? []
    },
  })

  const recentOrders = orders.slice(0, 5)
  const totalSpent = orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="px-8 pt-8 mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary mb-2">
          Bonjour, {username} 👋
        </h1>
        <p className="text-on-surface-variant">Retrouvez vos commandes et continuez vos achats.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 mb-10">
        <StatCard icon="shopping_bag" label="Commandes" value={orders.length.toString()} sub="au total" />
        <StatCard icon="payments" label="Total dépensé" value={formatPrice(totalSpent)} sub="commandes payées" highlight />
        <StatCard icon="pending_actions" label="En attente" value={orders.filter((o) => o.status === 'pending').length.toString()} sub="à traiter" />
      </div>

      <section className="px-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">Mes commandes récentes</h2>
          <Link href="/dashboard/orders" className="text-secondary text-sm font-bold hover:underline flex items-center gap-1">
            Tout voir <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {isLoading ? (
          <SkeletonTable rows={3} />
        ) : recentOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">shopping_cart</span>
            <p className="text-gray-500 font-medium mb-4">Vous n'avez pas encore de commande</p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-sm">storefront</span>
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['N° Commande', 'Date', 'Articles', 'Total', 'Statut'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-700">{order.order_number || `#${order.id}`}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{order.items?.length ?? 0} article(s)</td>
                      <td className="px-6 py-4 font-bold text-primary">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.style}`}>{cfg.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="px-8 mb-12">
        <div className="bg-primary-container rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-headline text-2xl font-bold text-white mb-2">Continuez vos achats</h3>
            <p className="text-secondary-container text-sm">Découvrez tous les produits disponibles sur la boutique.</p>
          </div>
          <Link href="/shop" className="shrink-0 bg-white text-primary font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
            <span className="material-symbols-outlined">storefront</span>
            Aller à la boutique
          </Link>
        </div>
      </section>
    </div>
  )
}

// ── Vue Vendeur ───────────────────────────────────────────────────────────────

function VendeurDashboard({ username }: { username: string }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['vendeur-stats'],
    queryFn: vendeurService.getStats,
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 px-8 pt-8">
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-primary leading-none mb-2">
            Bienvenue, {username} !
          </h1>
          <p className="text-on-surface-variant text-lg">Voici l&apos;analyse de vos performances stellaires aujourd&apos;hui.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-highest px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            Ce mois
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/10">
            <span className="material-symbols-outlined text-lg">download</span>
            Rapport Complet
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-8">
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-secondary">payments</span>
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-4">Ventes Totales</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black font-headline text-primary tracking-tighter">
              {isLoading ? '—' : formatPrice(stats?.total_revenue ?? '0')}
            </h2>
            <span className="text-green-600 text-sm font-bold">+12.4%</span>
          </div>
          <div className="mt-6 h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-3/4 rounded-full" />
          </div>
        </div>

        <div className="bg-primary-container p-8 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-white">rocket_launch</span>
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-on-primary-container mb-4">Produits Actifs</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black font-headline text-white tracking-tighter">
              {isLoading ? '—' : stats?.active_products_count ?? 0}
            </h2>
            <span className="text-secondary-container text-sm font-bold">En orbite</span>
          </div>
          <div className="flex gap-1 mt-6">
            {[8, 10, 6, 12, 9].map((h, i) => (
              <div key={i} className="w-1 bg-secondary rounded-full" style={{ height: `${h * 4}px`, opacity: 0.4 + i * 0.15 }} />
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-secondary">groups</span>
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-4">Meilleurs Promoteurs</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black font-headline text-primary tracking-tighter">
              {isLoading ? '—' : stats?.active_affiliates_count ?? 0}
            </h2>
            <span className="text-secondary text-sm font-bold">Affiliés actifs</span>
          </div>
          <div className="mt-6 flex -space-x-3">
            {['A', 'B', 'C'].map((l) => (
              <div key={l} className="w-10 h-10 rounded-full border-4 border-surface-container-lowest bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">{l}</div>
            ))}
            <div className="w-10 h-10 rounded-full border-4 border-surface-container-lowest bg-surface-container flex items-center justify-center text-[10px] font-bold">
              +{Math.max(0, (stats?.active_affiliates_count ?? 0) - 3)}
            </div>
          </div>
        </div>
      </div>

      <section className="px-8 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-headline text-2xl font-bold text-primary">Mes Pages de Vente</h3>
          <Link href="/dashboard/products" className="text-secondary font-bold text-sm flex items-center gap-1 hover:underline">
            Tout voir <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {(stats?.products ?? []).slice(0, 3).map((product: Product, idx: number) => (
              <ProductCard key={product.id} product={product} featured={idx === 0} />
            ))}
            {(stats?.products?.length ?? 0) < 3 && (
              <Link href="/dashboard/products" className="bg-surface-container-lowest rounded-[2rem] overflow-hidden border-2 border-dashed border-surface-container-high flex flex-col items-center justify-center p-12 hover:border-secondary transition-colors group min-h-[320px]">
                <span className="material-symbols-outlined text-5xl text-surface-container-high group-hover:text-secondary transition-colors mb-4">add_circle</span>
                <p className="font-headline font-bold text-on-surface-variant group-hover:text-secondary transition-colors">Nouveau Produit</p>
              </Link>
            )}
          </div>
        )}
      </section>

      <section className="px-8 mb-16">
        <div className="glass-card p-10 rounded-[2.5rem] border border-white/20 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-headline text-3xl font-extrabold text-primary mb-6">Écosystème Affilié</h3>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                Votre armée de promoteurs s&apos;agrandit. Gérez les commissions, les paliers de récompenses
                et fournissez des kits marketing personnalisés pour booster vos ventes indirectes.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/50 px-6 py-4 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest mb-1">Commission Moy.</p>
                  <p className="text-2xl font-black text-primary">{isLoading ? '—' : `${stats?.avg_commission_pct ?? 0}%`}</p>
                </div>
                <div className="bg-white/50 px-6 py-4 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest mb-1">Gain Affiliés</p>
                  <p className="text-2xl font-black text-primary">{isLoading ? '—' : formatPrice(stats?.total_affiliate_gain ?? '0')}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary h-40 rounded-3xl p-6 flex flex-col justify-between">
                <span className="material-symbols-outlined text-secondary-container text-3xl">auto_graph</span>
                <p className="text-white font-bold text-sm">Croissance Réseau +18%</p>
              </div>
              <div className="bg-secondary-container h-40 rounded-3xl p-6 flex flex-col justify-between">
                <span className="material-symbols-outlined text-on-secondary-container text-3xl">campaign</span>
                <p className="text-on-secondary-container font-bold text-sm">Nouveaux Assets Dispo</p>
              </div>
              <div className="bg-surface-container h-40 rounded-3xl p-6 flex flex-col justify-between col-span-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-on-surface text-sm font-bold">Top Promoteur du Mois</p>
                    <p className="text-on-surface-variant text-xs">Affilié actif • conversions récentes</p>
                  </div>
                  <span className="bg-white p-2 rounded-lg text-secondary">
                    <span className="material-symbols-outlined">emoji_events</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[85%]" />
                  </div>
                  <span className="text-xs font-bold text-on-surface">85% du quota</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Composants partagés ───────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, highlight = false }: {
  icon: string; label: string; value: string; sub: string; highlight?: boolean
}) {
  return (
    <div className={`p-8 rounded-3xl shadow-sm relative overflow-hidden ${highlight ? 'bg-primary-container' : 'bg-surface-container-lowest'}`}>
      <span className={`material-symbols-outlined text-3xl mb-4 block ${highlight ? 'text-secondary-container' : 'text-secondary'}`}>{icon}</span>
      <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${highlight ? 'text-secondary-container' : 'text-on-surface-variant'}`}>{label}</p>
      <p className={`text-4xl font-black font-headline tracking-tighter ${highlight ? 'text-white' : 'text-primary'}`}>{value}</p>
      <p className={`text-xs mt-1 ${highlight ? 'text-secondary-container' : 'text-gray-400'}`}>{sub}</p>
    </div>
  )
}

function ProductCard({ product, featured }: { product: Product; featured: boolean }) {
  const router = useRouter()
  return (
    <div className={`bg-surface-container-lowest rounded-[2rem] overflow-hidden group transition-all hover:shadow-2xl hover:shadow-black/5 ${featured ? 'ring-2 ring-secondary ring-offset-4 ring-offset-background' : ''}`}>
      <div className="h-56 w-full relative overflow-hidden bg-gradient-to-br from-primary-container to-secondary/30 flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-white/20">inventory_2</span>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {product.category || (product.is_digital ? 'Numérique' : 'Physique')}
          </span>
        </div>
        {featured && (
          <div className="absolute top-4 right-4 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">EN DIRECT</div>
        )}
      </div>
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-headline font-bold text-xl text-primary leading-tight">{product.name}</h4>
          <span className="text-secondary font-black text-xl">{formatPrice(product.price)}</span>
        </div>
        <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">{product.description || 'Aucune description.'}</p>
        <div className="flex items-center justify-between pt-6 border-t border-surface-container">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-lg">visibility</span>
            <span className="text-xs font-semibold">{product.views_count?.toLocaleString('fr-FR') ?? 0} vues</span>
          </div>
          <button
            onClick={() => router.push(`/dashboard/builder/${product.id}`)}
            className={`flex items-center gap-2 transition-colors px-4 py-2 rounded-xl text-sm font-bold ${featured ? 'text-white bg-secondary shadow-lg shadow-secondary/20' : 'text-secondary bg-secondary/5 hover:bg-secondary hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            {featured ? 'Personnaliser la Page' : 'Modifier la Page'}
          </button>
        </div>
      </div>
    </div>
  )
}
