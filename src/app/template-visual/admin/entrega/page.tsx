'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { Button } from '@/components/template-alternativa/Button'
import { ConfirmDialog } from '@/components/template-alternativa/ConfirmDialog'
import { Toast } from '@/components/template-alternativa/Toast'
import { formatCPF, totalMoradores } from '@/lib/template-alternativa/format'
import { mockBeneficiariosAprovados, mockConfirmadosSessao, type MockBeneficiario } from '@/lib/template-alternativa/mock-data'

type Status = 'idle' | 'pode_retirar' | 'ja_retirou' | 'nao_cadastrado'

// Sem chamada de API: a busca por CPF cicla entre os 3 estados possíveis a
// partir do último dígito digitado, só para demonstrar os estados visuais.
function statusSimulado(cpfLimpo: string): { status: Status; pessoa: MockBeneficiario | null } {
  const ultimo = parseInt(cpfLimpo[cpfLimpo.length - 1] || '0', 10)
  if (ultimo <= 3) return { status: 'nao_cadastrado', pessoa: null }
  if (ultimo <= 6) return { status: 'ja_retirou', pessoa: mockBeneficiariosAprovados[0] }
  return { status: 'pode_retirar', pessoa: mockBeneficiariosAprovados[ultimo % mockBeneficiariosAprovados.length] }
}

export default function TemplateEntregaPage() {
  const router = useRouter()
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [pessoa, setPessoa] = useState<MockBeneficiario | null>(null)
  const [confirmados, setConfirmados] = useState(mockConfirmadosSessao)
  const [modalEncerrar, setModalEncerrar] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function buscar() {
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length < 11) return
    setLoading(true)
    setTimeout(() => {
      const resultado = statusSimulado(cpfLimpo)
      setStatus(resultado.status)
      setPessoa(resultado.pessoa)
      setLoading(false)
    }, 400)
  }

  function confirmar() {
    if (!pessoa) return
    setConfirmados((prev) => [{ nome: pessoa.nome, cpf: formatCPF(pessoa.cpf) }, ...prev])
    setToast(`Retirada de ${pessoa.nome} confirmada.`)
    setStatus('idle')
    setCpf('')
    setPessoa(null)
    inputRef.current?.focus()
  }

  function encerrar() {
    setModalEncerrar(false)
    router.push('/template-visual/admin')
  }

  const statusStyle: Record<Exclude<Status, 'idle'>, { bg: string; border: string; text: string; title: string; msg: string }> = {
    pode_retirar: { bg: 'bg-[var(--tpl-success-soft)]', border: 'border-emerald-300', text: 'text-[var(--tpl-success)]', title: '✓ Pode retirar', msg: 'Família cadastrada e apta a receber a cesta.' },
    ja_retirou: { bg: 'bg-[var(--tpl-warning-soft)]', border: 'border-amber-300', text: 'text-[var(--tpl-warning)]', title: '⚠ Já retirou', msg: 'Esta família já retirou a cesta nesta entrega.' },
    nao_cadastrado: { bg: 'bg-[var(--tpl-danger-soft)]', border: 'border-red-300', text: 'text-[var(--tpl-danger)]', title: '✕ Não cadastrado', msg: 'Este CPF não está na lista. Verifique o número ou cadastre a família.' },
  }

  return (
    <AdminShell title="Entrega de cestas" backHref="/template-visual/admin"
      headerAction={<button onClick={() => setModalEncerrar(true)} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white/15 text-white sm:bg-transparent sm:text-[var(--tpl-danger)] sm:border sm:border-red-200">Encerrar</button>}>
      <div className="space-y-5">
        <div>
          <p className="tpl-eyebrow mb-2">CPF do beneficiário</p>
          <div className="flex gap-2.5">
            <input ref={inputRef} value={cpf}
              onChange={(e) => { setCpf(formatCPF(e.target.value)); setStatus('idle') }}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
              type="text" inputMode="numeric" placeholder="000.000.000-00" maxLength={14}
              className="flex-1 border-2 border-[var(--tpl-border)] rounded-xl px-4 py-3 text-base outline-none focus:border-[var(--tpl-primary)] bg-white tracking-wider" />
            <Button onClick={buscar} disabled={loading || cpf.replace(/\D/g, '').length < 11}>
              {loading ? '…' : 'Buscar'}
            </Button>
          </div>
        </div>

        {status !== 'idle' && (
          <div className={`rounded-2xl p-4 border-2 ${statusStyle[status].bg} ${statusStyle[status].border}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${statusStyle[status].text}`}>{statusStyle[status].title}</p>
            <p className="text-xl font-tpl-serif font-bold mb-1 text-[var(--tpl-text-primary)]">{pessoa?.nome || 'CPF não encontrado'}</p>
            <p className="text-sm text-[var(--tpl-text-secondary)] mb-2">{statusStyle[status].msg}</p>
            {pessoa && (
              <p className="text-xs text-[var(--tpl-text-secondary)] bg-white/60 rounded-lg px-3 py-2 mb-3">
                {totalMoradores(pessoa)} pessoa{totalMoradores(pessoa) !== 1 ? 's' : ''} na casa · {pessoa.criancas} criança{pessoa.criancas !== 1 ? 's' : ''} · {pessoa.adultos} adulto{pessoa.adultos !== 1 ? 's' : ''}
              </p>
            )}
            {status === 'pode_retirar' && (
              <Button fullWidth className="!bg-[var(--tpl-success)] hover:!bg-emerald-700" onClick={confirmar}>
                ✓ Confirmar retirada
              </Button>
            )}
          </div>
        )}

        <div>
          <p className="tpl-eyebrow mb-2">Confirmadas nesta sessão ({confirmados.length})</p>
          {confirmados.length === 0 ? (
            <p className="text-sm text-[var(--tpl-text-muted)]">Nenhuma confirmação ainda.</p>
          ) : (
            <div className="space-y-2">
              {confirmados.map((c, i) => (
                <div key={i} className="bg-[var(--tpl-surface-card)] border border-[var(--tpl-border)] rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--tpl-text-primary)]">{c.nome}</p>
                    <p className="text-xs text-[var(--tpl-text-muted)] mt-0.5">{c.cpf}</p>
                  </div>
                  <span className="text-xs font-bold bg-[var(--tpl-success-soft)] text-[var(--tpl-success)] px-2.5 py-1 rounded-full">Retirou</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={modalEncerrar}
        onClose={() => setModalEncerrar(false)}
        onConfirm={encerrar}
        title="Encerrar entrega"
        description="Encerrar salva os resultados no histórico. Você poderá visualizar os dados depois."
        confirmLabel="Encerrar"
      />

      {toast && <Toast message={toast} tone="success" onClose={() => setToast(null)} />}
    </AdminShell>
  )
}
