// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ServiceWorkerRegister } from './sw-register'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cesta Solidária — AltVida',
  description: 'Plataforma de distribuição de cestas básicas da Comunidade Batista Alternativa de Vida',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cesta Solidária',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3C2A6E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
