import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--tpl-border)] bg-[var(--tpl-surface-muted)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row gap-8 sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon_transparente.png" alt="" aria-hidden="true"
          className="w-32 h-32 sm:w-44 sm:h-44 object-contain flex-shrink-0 mx-auto sm:mx-0 opacity-90" />

        <div className="grid gap-8 sm:grid-cols-3 text-sm flex-1">
          <div>
            <p className="font-tpl-serif font-bold text-lg text-[var(--tpl-text-primary)] mb-2">Cesta Solidária</p>
            <p className="text-[var(--tpl-text-secondary)] leading-relaxed">
              Um gesto de cuidado da Comunidade Batista Alternativa de Vida · Jaraguá para famílias da nossa região.
            </p>
          </div>
          <div>
            <p className="tpl-eyebrow mb-3">Navegação</p>
            <ul className="space-y-2 text-[var(--tpl-text-secondary)]">
              <li><Link href="/" className="hover:text-[var(--tpl-primary)] hover:underline">Início</Link></li>
              <li><Link href="/cadastro" className="hover:text-[var(--tpl-primary)] hover:underline">Fazer cadastro</Link></li>
              <li><Link href="/consulta" className="hover:text-[var(--tpl-primary)] hover:underline">Consultar cadastro</Link></li>
              <li><Link href="/voluntarios" className="hover:text-[var(--tpl-primary)] hover:underline">Ser voluntário</Link></li>
            </ul>
          </div>
          <div>
            <p className="tpl-eyebrow mb-3">Acesso à equipe</p>
            <ul className="space-y-2 text-[var(--tpl-text-secondary)]">
              <li><Link href="/admin/login" className="hover:text-[var(--tpl-primary)] hover:underline">Área administrativa</Link></li>
            </ul>
            <p className="text-xs text-[var(--tpl-text-muted)] mt-4">Ação voluntária, sem fins lucrativos.</p>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--tpl-border)] px-4 sm:px-6 py-4 text-center text-xs text-[var(--tpl-text-muted)]">
        Comunidade Batista Alternativa de Vida
      </div>
    </footer>
  )
}
