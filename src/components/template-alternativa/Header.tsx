'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/template-visual', label: 'Início' },
  { href: '/template-visual/cadastro', label: 'Cadastro' },
  { href: '/template-visual/consulta', label: 'Consultar' },
  { href: '/template-visual/voluntarios', label: 'Voluntários' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 bg-[var(--tpl-primary)] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/template-visual" className="flex items-center gap-2 font-tpl-serif font-bold text-lg flex-shrink-0">
          <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base" aria-hidden="true">🧺</span>
          <span className="hidden xs:inline">Cesta Solidária</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10',
                pathname === item.href && 'bg-white/15'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/template-visual/admin/login"
          className="text-xs font-semibold px-3 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition-colors flex-shrink-0"
        >
          Área administrativa
        </Link>
      </div>

      <nav className="sm:hidden flex overflow-x-auto tpl-scrollbar-hide gap-1.5 px-4 pb-3">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-white/10',
              pathname === item.href && 'bg-white/25'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
