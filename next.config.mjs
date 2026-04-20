// Auteur : Gilles - Projet : AGC Space - Module : Configuration Next.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // ── Rewrites API ────────────────────────────────────────────────────────────
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
      },
    ]
  },

  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost',          port: '8000', pathname: '/media/**' },
      { protocol: 'https', hostname: '**.ngrok-free.app',               pathname: '/media/**' },
      { protocol: 'https', hostname: '**.ngrok-free.dev',               pathname: '/media/**' },
    ],
  },
}

export default nextConfig
