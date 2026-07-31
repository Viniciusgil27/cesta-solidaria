// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ServiceWorkerRegister } from './sw-register'

const inter = Inter({ subsets: ['latin'], variable: '--font-tpl-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700', '900'], variable: '--font-tpl-playfair' })

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
  themeColor: '#8b2020',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} font-tpl-sans`}>
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
