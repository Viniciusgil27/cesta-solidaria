'use client'
// src/components/admin/NovaEntregaButton.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FormField, tplInputClass } from '@/components/ui/FormField'

export function NovaEntregaButton() {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [local, setLocal] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const hoje = new Date().toISOString().split('T')[0]

  async function iniciar() {
    setErro('')
    if (!data) { setErro('Selecione a data da entrega.'); return }
    if (!horario) { setErro('Selecione o horário da entrega.'); return }
    if (!local.trim()) { setErro('Informe o local.'); return }
    setLoading(true)
    const dataHoraISO = new Date(`${data}T${horario}`).toISOString()
    const res = await fetch('/api/entregas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dataHoraISO, local }),
    })
    setLoading(false)
    if (!res.ok) { setErro('Erro ao criar entrega.'); return }
    setAberto(false)
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setAberto(true)}
        className="flex items-center gap-3 w-full rounded-xl p-4 border font-semibold text-sm bg-amber-50 border-amber-200 hover:bg-amber-100 transition-colors">
        <span className="text-xl">🗓️</span>
        <div className="text-left">
          <p className="text-amber-800">Nova entrega</p>
          <p className="font-normal text-amber-600 text-xs">Definir data, horário e zerar retiradas</p>
        </div>
      </button>

      <Modal open={aberto} onClose={() => setAberto(false)} title="🗓️ Nova entrega">
        <div className="bg-[var(--tpl-warning-soft)] border border-amber-200 rounded-xl p-3 mb-4 text-xs text-[var(--tpl-warning)] leading-relaxed">
          ⚠️ Iniciar uma nova entrega vai <strong>zerar o status de quem já retirou</strong> e salvar o histórico. Os cadastros não serão removidos.
        </div>

        {erro && <div className="bg-[var(--tpl-danger-soft)] border border-red-200 rounded-xl p-3 mb-3 text-sm text-[var(--tpl-danger)] font-medium">{erro}</div>}

        <div className="space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Data" htmlFor="data-entrega">
              <input id="data-entrega" type="date" min={hoje} value={data} onChange={e => setData(e.target.value)} className={tplInputClass} />
            </FormField>
            <FormField label="Horário" htmlFor="horario-entrega">
              <input id="horario-entrega" type="time" value={horario} onChange={e => setHorario(e.target.value)} className={tplInputClass} />
            </FormField>
          </div>
          <FormField label="Local" htmlFor="local-entrega">
            <input id="local-entrega" type="text" value={local} onChange={e => setLocal(e.target.value)}
              className={tplInputClass} placeholder="Rua das Flores, 142 — Vila Santa Cruz" />
          </FormField>
        </div>

        <Button onClick={iniciar} disabled={loading} fullWidth>
          {loading ? 'Criando…' : 'Iniciar nova entrega'}
        </Button>
      </Modal>
    </>
  )
}
