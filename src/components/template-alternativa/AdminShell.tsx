'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { mockAdminLogado } from '@/lib/template-alternativa/mock-data'

const NAV = [
  { href: '/template-visual/admin', label: 'Painel', icon: '🏠' },
  { href: '/template-visual/admin/pendentes', label: 'Pendentes', icon: '🕐' },
  { href: '/template-visual/admin/beneficiarios', label: 'Famílias', icon: '👥' },
  { href: '/template-visual/admin/entrega', label: 'Entrega', icon: '🧺' },
  { href: '/template-visual/admin/voluntarios', label: 'Voluntários', icon: '🙋' },
]

interface AdminShellProps {
  title: string
  backHref?: string
  headerAction?: React.ReactNode
  children: React.ReactNode
}

// Navegação persistente da área administrativa do protótipo. O app real não
// tem nenhum componente equivalente — cada tela repete seu próprio cabeçalho
// e não existe navegação entre seções administrativas sem voltar ao painel.
export function AdminShell({ title, backHref, headerAction, children }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="min-h-[100dvh] flex flex-col sm:flex-row">
      <aside className="hidden sm:flex sm:flex-col w-60 flex-shrink-0 bg-[var(--tpl-primary)] text-white p-5">
        <Link href="/template-visual/admin" className="font-tpl-serif font-bold text-lg mb-8 flex items-center gap-2">
          <span aria-hidden="true">🧺</span> Cesta Solidária
        </Link>
        <nav className="space-y-1 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10',
                pathname === item.href && 'bg-white/15'
              )}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="pt-4 border-t border-white/15">
          <p className="text-xs text-white/60 mb-2">Conectado como</p>
          <p className="text-sm font-semibold mb-3">{mockAdminLogado.nome}</p>
          <button
            onClick={() => router.push('/template-visual/admin/login')}
            className="text-xs text-white/70 hover:text-white text-left"
          >
            ← Sair (protótipo)
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sm:hidden sticky top-0 z-20 bg-[var(--tpl-primary)] text-white px-4 py-4 flex items-center gap-3">
          {backHref && (
            <Link href={backHref} className="text-xl leading-none" aria-label="Voltar">‹</Link>
          )}
          <p className="text-sm font-semibold flex-1 truncate">{title}</p>
          {headerAction}
        </header>

        <header className="hidden sm:flex items-center justify-between px-8 py-5 border-b border-[var(--tpl-border)] bg-[var(--tpl-surface-card)]">
          <h1 className="font-tpl-serif font-bold text-xl text-[var(--tpl-text-primary)]">{title}</h1>
          {headerAction}
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-3xl w-full mx-auto pb-24 sm:pb-8">{children}</main>

        <nav className="sm:hidden sticky bottom-0 bg-[var(--tpl-surface-card)] border-t border-[var(--tpl-border)] flex justify-around py-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium min-w-[44px]',
                pathname === item.href ? 'text-[var(--tpl-primary)]' : 'text-[var(--tpl-text-muted)]'
              )}
            >
              <span className="text-base" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
