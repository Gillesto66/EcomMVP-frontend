// Auteur : Gilles - Projet : AGC Space - Module : Page Home
// 'use client' requis : force-dynamic seul ne suffit pas en Next.js 14.2.x
// avec des Client Components Zustand dans le layout (bug clientModules)
'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="bg-primary-container text-white font-body min-h-screen selection:bg-secondary-container selection:text-primary-container">

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-xl shadow-black/5 flex justify-between items-center px-8 h-20">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black text-[#0B192E] font-headline tracking-tight">AGC Space</span>
          <div className="hidden md:flex gap-6 items-center">
            {['Plateforme', 'Partenaires', 'Vendeurs', 'Tarifs'].map((item) => (
              <a key={item} href="#" className="text-sm text-slate-600 hover:text-[#006875] transition-all duration-300">
                {item}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-6 py-2 text-sm font-semibold text-slate-600 hover:text-[#006875] transition-all">
            Connexion
          </Link>
          <Link href="/register" className="bg-gradient-to-r from-primary-container to-secondary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:brightness-110 transition-all">
            Rejoindre
          </Link>
        </div>
      </nav>

      <main className="pt-20">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-20 pb-32 px-8">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/40 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium text-[#00daf3] text-xs font-bold uppercase tracking-widest mb-8 border border-white/10">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              L&apos;Horizon Infini du Commerce
            </div>

            <h1 className="font-headline font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] text-white mb-8 max-w-5xl">
              AGC Space : L&apos;écosystème complet pour l&apos;E-commerce{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00e3fd]">
                intelligent
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed">
              Lancez, développez et automatisez votre tunnel de vente avec un constructeur intelligent
              et un suivi d&apos;affiliation transparent. L&apos;autorité digitale redéfinie.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <Link href="/register" className="bg-gradient-to-r from-[#00E3FD] to-[#006875] text-primary-container px-10 py-5 rounded-xl font-bold text-lg shadow-2xl shadow-cyan-500/20 hover:scale-105 transition-transform">
                Accès Anticipé
              </Link>
              <button className="px-10 py-5 rounded-xl font-bold text-lg text-white glass-premium hover:bg-white/10 transition-colors">
                Voir la Démo
              </button>
            </div>

            {/* Dashboard preview card */}
            <div className="mt-24 relative w-full max-w-6xl mx-auto">
              <div className="rounded-2xl p-2 glass-premium shadow-2xl shadow-black/50">
                <div className="rounded-xl bg-[#0e1c31]/80 h-80 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-4 w-full max-w-2xl px-8">
                    {[
                      { label: 'Ventes Totales', value: '42 850 €', trend: '+12.4%' },
                      { label: 'Produits Actifs', value: '18', trend: 'En orbite' },
                      { label: 'Affiliés Actifs', value: '342', trend: '+8 ce mois' },
                    ].map((stat) => (
                      <div key={stat.label} className="glass-premium rounded-xl p-4 text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-white font-headline">{stat.value}</p>
                        <p className="text-xs text-[#00e3fd] mt-1">{stat.trend}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-12 -left-12 p-6 glass-premium rounded-2xl hidden lg:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#00e3fd]">rocket_launch</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-slate-400 uppercase tracking-tighter">Vitesse de Flux</div>
                    <div className="text-xl font-bold text-white tracking-tight">+142%</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 p-6 glass-premium rounded-2xl hidden lg:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#00e3fd]">shield</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-slate-400 uppercase tracking-tighter">Sécurité AGC</div>
                    <div className="text-xl font-bold text-white tracking-tight">Certifié</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bento Features ─────────────────────────────────────────────── */}
        <section className="py-32 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="font-headline font-extrabold text-4xl text-white mb-4">Une Architecture Dimensionnelle</h2>
              <p className="text-slate-400">Trois piliers pour dominer votre marché vertical.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 glass-premium p-10 rounded-3xl flex flex-col justify-between group overflow-hidden relative min-h-[280px]">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-4xl text-[#00e3fd] mb-6 block" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
                  <h3 className="text-3xl font-headline font-bold text-white mb-4">Constructeur de Tunnels Intelligent</h3>
                  <p className="text-slate-400 max-w-md">Créez des parcours d&apos;achat asymétriques et ultra-performants sans aucune limite technique.</p>
                </div>
              </div>
              <div className="md:col-span-4 bg-gradient-to-br from-secondary/20 to-transparent p-8 rounded-3xl flex flex-col justify-end border border-white/5">
                <span className="material-symbols-outlined text-4xl text-[#00e3fd] mb-6">monitoring</span>
                <h3 className="text-2xl font-headline font-bold text-white mb-2">Suivi d&apos;Affiliation</h3>
                <p className="text-slate-400 text-sm">Transparence totale. Gérez vos partenaires avec une précision chirurgicale.</p>
              </div>
              <div className="md:col-span-4 glass-premium p-8 rounded-3xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl text-[#00e3fd]">hub</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-white mb-2">Connectivité API</h3>
                <p className="text-slate-400 text-sm">Intégrez vos outils préférés dans une plateforme unifiée.</p>
              </div>
              <div className="md:col-span-8 bg-white/5 p-8 rounded-3xl flex items-center gap-10 border border-white/5">
                <div className="flex-1">
                  <h3 className="text-2xl font-headline font-bold text-white mb-2">Automation Spatiale</h3>
                  <p className="text-slate-400 text-sm">Laissez nos algorithmes gérer l&apos;A/B testing en temps réel pendant que vous vous concentrez sur la stratégie.</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#00e3fd]">auto_awesome</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <section className="py-24 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { value: '99.9%', label: 'Uptime Garanti' },
              { value: '2.4M', label: 'Transactions/Mois' },
              { value: '150+', label: 'Pays Couverts' },
              { value: '24/7', label: 'Support Expert' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-5xl font-black text-white font-headline mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-slate-400 uppercase text-xs tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <section className="py-32 px-8">
          <div className="max-w-5xl mx-auto glass-premium rounded-[3rem] p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-white mb-6">
                Prêt à franchir l&apos;horizon ?
              </h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                Rejoignez les leaders de l&apos;e-commerce qui façonnent déjà le futur de la vente directe sur AGC Space.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <input
                  type="email"
                  placeholder="Votre adresse e-mail"
                  className="bg-primary/50 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 w-full sm:w-80"
                />
                <Link href="/register" className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-[#00e3fd] hover:text-primary-container transition-colors">
                  Commencer l&apos;Aventure
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#0B192E] w-full py-12 border-t border-white/5 flex flex-col items-center gap-8 px-10">
        <div className="flex flex-col items-center gap-4">
          <span className="text-xl font-black text-white font-headline">AGC Space</span>
          <div className="flex flex-wrap justify-center gap-8">
            {['Conditions Générales', 'Confidentialité', 'Support', 'Documentation'].map((item) => (
              <a key={item} href="#" className="text-xs uppercase tracking-widest text-slate-500 hover:text-[#00E3FD] transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-400 text-center">
          © 2024 AGC Space. L&apos;Horizon Infini.
        </p>
      </footer>
    </div>
  )
}
