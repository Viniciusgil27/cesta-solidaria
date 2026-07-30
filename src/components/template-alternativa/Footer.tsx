import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--tpl-border)] bg-[var(--tpl-surface-muted)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-tpl-serif font-bold text-lg text-[var(--tpl-text-primary)] mb-2">Cesta Solidária</p>
          <p className="text-[var(--tpl-text-secondary)] leading-relaxed">
            Um gesto de cuidado da Comunidade Batista Alternativa de Vida · Jaraguá para famílias da nossa região.
          </p>
        </div>
        <div>
          <p className="tpl-eyebrow mb-3">Navegação</p>
          <ul className="space-y-2 text-[var(--tpl-text-secondary)]">
            <li><Link href="/template-visual" className="hover:text-[var(--tpl-primary)] hover:underline">Início</Link></li>
            <li><Link href="/template-visual/cadastro" className="hover:text-[var(--tpl-primary)] hover:underline">Fazer cadastro</Link></li>
            <li><Link href="/template-visual/consulta" className="hover:text-[var(--tpl-primary)] hover:underline">Consultar cadastro</Link></li>
            <li><Link href="/template-visual/voluntarios" className="hover:text-[var(--tpl-primary)] hover:underline">Ser voluntário</Link></li>
          </ul>
        </div>
        <div>
          <p className="tpl-eyebrow mb-3">Acesso à equipe</p>
          <ul className="space-y-2 text-[var(--tpl-text-secondary)]">
            <li><Link href="/template-visual/admin/login" className="hover:text-[var(--tpl-primary)] hover:underline">Área administrativa</Link></li>
          </ul>
          <p className="text-xs text-[var(--tpl-text-muted)] mt-4">Ação voluntária, sem fins lucrativos.</p>
        </div>
      </div>
      <div className="border-t border-[var(--tpl-border)] px-4 sm:px-6 py-4 text-center text-xs text-[var(--tpl-text-muted)]">
        Protótipo visual — Comunidade Batista Alternativa de Vida
      </div>
    </footer>
  )
}
