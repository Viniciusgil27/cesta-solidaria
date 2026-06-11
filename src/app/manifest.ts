// src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cesta Solidária — AltVida',
    short_name: 'Cesta Solidária',
    description: 'Plataforma de distribuição de cestas básicas da Comunidade Batista Alternativa de Vida · Jaraguá',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0EBF8',
    theme_color: '#3C2A6E',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
