import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import '@/styles/template-alternativa.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-tpl-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700', '900'], variable: '--font-tpl-playfair' })

export const metadata: Metadata = {
  title: 'Cesta Solidária — Protótipo visual',
  description: 'Protótipo visual isolado, não navegável a partir do sistema em produção.',
  robots: { index: false, follow: false },
}

// Rota isolada: tudo aqui dentro fica escopado em .tpl-av (ver
// src/styles/template-alternativa.css) e não altera nenhuma página existente.
export default function TemplateVisualLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${playfair.variable} tpl-av font-tpl-sans`}>
      {children}
    </div>
  )
}
