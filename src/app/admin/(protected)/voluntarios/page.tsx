'use client'
// src/app/admin/(protected)/voluntarios/page.tsx
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatCPF, formatPhone, iniciais } from '@/lib/utils'
import type { Voluntario } from '@/types'
import { AdminShell } from '@/components/ui/AdminShell'
import { DataList, DataRow } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { tplInputClass } from '@/components/ui/FormField'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'

export default function VoluntariosPage() {
  const [lista, setLista] = useState<Voluntario[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async (termo = '') => {
    setCarregando(true)
    const res = await fetch(`/api/voluntarios?busca=${encodeURIComponent(termo)}`)
    if (res.ok) setLista(await res.json())
    setCarregando(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function buscar(e: React.FormEvent) {
    e.preventDefault()
    carregar(busca)
  }

  async function remover(v: Voluntario) {
    if (!confirm(`Remover ${v.nome} da lista de voluntários? Esta ação não pode ser desfeita.`)) return
    await fetch(`/api/voluntarios/${v.id}`, { method: 'DELETE' })
    carregar(busca)
  }

  return (
    <AdminShell title="Voluntários" backHref="/admin">
      <div className="space-y-4">
        <form onSubmit={buscar} className="flex gap-2">
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone…"
            className={tplInputClass + ' flex-1 min-w-0'}
          />
          <Button type="submit" className="flex-shrink-0">Buscar</Button>
        </form>

        <p className="text-xs text-[var(--tpl-text-muted)] font-medium">
          {carregando ? 'Carregando…' : `${lista.length} voluntário${lista.length !== 1 ? 's' : ''} encontrado${lista.length !== 1 ? 's' : ''}`}
        </p>

        {carregando && <LoadingState />}

        <DataList>
          {lista.map(v => (
            <DataRow key={v.id} className="flex-col items-stretch sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
                  {iniciais(v.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate text-[var(--tpl-text-primary)]">{v.nome}</p>
                    <Badge tone={v.status === 'ATIVO' ? 'success' : 'neutral'}>{v.status === 'ATIVO' ? 'Ativo' : 'Inativo'}</Badge>
                  </div>
                  <p className="text-xs text-[var(--tpl-text-muted)] truncate font-tpl-legible">{formatCPF(v.cpf)} · {formatPhone(v.telefone)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-shrink-0">
                <Link href={`/admin/voluntarios/${v.id}`}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--tpl-border)] text-[var(--tpl-text-secondary)] hover:bg-[var(--tpl-surface-muted)] transition-colors text-center">
                  Ver
                </Link>
                <button onClick={() => remover(v)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-[var(--tpl-danger)] hover:bg-[var(--tpl-danger-soft)] transition-colors">
                  Remover
                </button>
              </div>
            </DataRow>
          ))}
        </DataList>

        {!carregando && lista.length === 0 && (
          <EmptyState icon="🙋" title="Nenhum voluntário" description={busca ? 'Nenhum resultado para a busca.' : 'Nenhum voluntário cadastrado ainda.'} />
        )}
      </div>
    </AdminShell>
  )
}
