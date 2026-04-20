'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Dashboard - Layout
import { useAuthStore } from '@/src/modules/auth/store/authStore'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import ToastContainer from '@/src/components/ui/Toast'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de Bord', icon: 'dashboard', roles: ['ecommercant', 'client', 'affilie'] },
  { href: '/shop', label: 'Boutique', icon: 'storefront', roles: ['client'] },
  { href: '/dashboard/products', label: 'Produits', icon: 'inventory_2', roles: ['ecommercant'] },
  { href: '/dashboard/theme', label: 'Design', icon: 'palette', roles: ['ecommercant'] },
  { href: '/dashboard/affiliations', label: 'Affiliation', icon: 'hub', roles: ['affilie', 'ecommercant'] },
  { href: '/dashboard/orders', label: 'Commandes', icon: 'shopping_bag', roles: ['client', 'ecommercant'] },
] as const

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, hasRole, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  if (!user) return null

  const visibleNav = NAV_ITEMS.filter((item) =>
    item.roles.some((r) => hasRole(r as Parameters<typeof hasRole>[0]))
  )

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-white hidden lg:flex flex-col py-6 z-40 shadow-sm">
        {/* Logo */}
        <div className="px-8 mb-10">
          <Link href="/" className="text-2xl font-black text-[#0B192E] font-headline tracking-tight block mb-1">
            AGC Space
          </Link>
          <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold">Niveau : Galaxie</p>
        </div>

        {/* Profil + CTA */}
        <div className="px-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-container">person</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#0B192E] leading-tight">{user.username}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</p>
            </div>
          </div>
          {/* Badge rôle + CTA contextuel */}
          {hasRole('ecommercant') && (
            <button className="w-full bg-secondary text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:translate-x-1 transition-transform">
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Nouvelle Campagne
            </button>
          )}
          {!hasRole('ecommercant') && hasRole('client') && (
            <a href="/shop" className="w-full bg-primary text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:translate-x-1 transition-transform">
              <span className="material-symbols-outlined text-sm">storefront</span>
              Aller à la boutique
            </a>
          )}
          {!hasRole('ecommercant') && hasRole('affilie') && (
            <a href="/dashboard/affiliations" className="w-full bg-secondary text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:translate-x-1 transition-transform">
              <span className="material-symbols-outlined text-sm">hub</span>
              Mes liens affiliés
            </a>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1" aria-label="Navigation principale">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`py-3 px-6 my-1 flex items-center gap-4 rounded-r-full transition-transform hover:translate-x-1 ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-[#0E1C31] to-[#006875] text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="mt-auto px-4 border-t border-slate-100 pt-6">
          <a href="#" className="text-slate-500 hover:text-secondary py-3 px-6 flex items-center gap-4 transition-transform hover:translate-x-1">
            <span className="material-symbols-outlined">help</span>
            <span className="text-sm font-medium">Aide</span>
          </a>
          <button
            onClick={() => { logout(); router.push('/login') }}
            className="w-full text-slate-500 hover:text-red-500 py-3 px-6 flex items-center gap-4 transition-transform hover:translate-x-1"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ─────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 overflow-y-auto" id="main-content">
        {children}
      </main>

      <ToastContainer />
    </div>
  )
}
