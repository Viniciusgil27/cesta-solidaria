'use client'
// src/components/admin/NovaEntregaButton.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

      {aberto && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && setAberto(false)}>
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">🗓️ Nova entrega</h3>
              <button onClick={() => setAberto(false)} className="text-slate-400 text-xl leading-none">✕</button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700 leading-relaxed">
              ⚠️ Iniciar uma nova entrega vai <strong>zerar o status de quem já retirou</strong> e salvar o histórico. Os cadastros não serão removidos.
            </div>

            {erro && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-sm text-red-700">{erro}</div>}

            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Data</label>
                  <input type="date" min={hoje} value={data} onChange={e => setData(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Horário</label>
                  <input type="time" value={horario} onChange={e => setHorario(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Local</label>
                <input type="text" value={local} onChange={e => setLocal(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors"
                  placeholder="Rua das Flores, 142 — Vila Santa Cruz" />
              </div>
            </div>

            <button onClick={iniciar} disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
              style={{ background: 'var(--roxo)' }}>
              {loading ? 'Criando…' : 'Iniciar nova entrega'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
