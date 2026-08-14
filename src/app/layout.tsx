// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Atkinson_Hyperlegible } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ServiceWorkerRegister } from './sw-register'

const inter = Inter({ subsets: ['latin'], variable: '--font-tpl-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700', '900'], variable: '--font-tpl-playfair' })
// Fonte desenhada pro Braille Institute pra maximizar a distinção entre
// caracteres parecidos (1/I/l, 0/O) — usada só em dados críticos (CPF,
// telefone, datas/horários, senha, status, números), não no corpo geral.
const atkinson = Atkinson_Hyperlegible({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-tpl-legible' })

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
      <body className={`${inter.variable} ${playfair.variable} ${atkinson.variable} font-tpl-sans`}>
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
