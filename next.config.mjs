// Auteur : Gilles - Projet : AGC Space - Module : Configuration Next.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' est utile pour Docker/self-hosted, mais inutile sur Vercel
  // Vercel gère lui-même le packaging — laisser commenté pour compatibilité universelle
  // output: 'standalone',

  // ── Redirects ───────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Ngrok affiche une page d'interstitiel sur les requêtes browser — bypass via header
      // (géré côté axios dans api.ts, pas ici)
    ]
  },

  // ── Rewrites API ────────────────────────────────────────────────────────────
  // Proxy vers le backend uniquement en développement local.
  // En production (Vercel), le frontend appelle directement NEXT_PUBLIC_API_URL
  // via apiClient (axios), donc ce rewrite n'est pas utilisé en prod.
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ]
  },

  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost',          port: '8000', pathname: '/media/**' },
      { protocol: 'https', hostname: 'pomological-unlucidly-su.ngrok-free.dev', pathname: '/media/**' },
      { protocol: 'https', hostname: '**.ngrok-free.app',               pathname: '/media/**' },
      { protocol: 'https', hostname: '**.ngrok-free.dev',               pathname: '/media/**' },
    ],
  },
}

export default nextConfig
