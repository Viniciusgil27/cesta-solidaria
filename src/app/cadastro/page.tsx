'use client'
// src/app/cadastro/page.tsx
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCPF, formatPhone } from '@/lib/utils'

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-2">
      <span className="text-xs text-slate-500 text-center leading-tight">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-purple-700 font-medium hover:bg-purple-50 transition-colors">−</button>
        <span className="text-base font-bold w-5 text-center">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-purple-700 font-medium hover:bg-purple-50 transition-colors">+</button>
      </div>
    </div>
  )
}

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

export default function CadastroPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: '', cpf: '', telefone: '', endereco: '', bairro: '',
    criancas: 0, adolescentes: 0, adultos: 0, idosos: 0,
  })

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadErro, setUploadErro] = useState('')
  const [comprovanteUrl, setComprovanteUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    // Preview local imediato
    setPreviewUrl(URL.createObjectURL(arquivo))
    setUploadStatus('uploading')
    setUploadErro('')
    setComprovanteUrl('')

    const formData = new FormData()
    formData.append('arquivo', arquivo)

    try {
      const res = await fetch('/api/upload/comprovante', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setUploadStatus('error')
        setUploadErro(data.error || 'Erro ao enviar imagem.')
        setPreviewUrl('')
        return
      }
      setComprovanteUrl(data.url)
      setUploadStatus('done')
    } catch {
      setUploadStatus('error')
      setUploadErro('Erro de conexão. Tente novamente.')
      setPreviewUrl('')
    }

    // Limpa o input para permitir reenvio do mesmo arquivo
    e.target.value = ''
  }

  function removerComprovante() {
    setComprovanteUrl('')
    setPreviewUrl('')
    setUploadStatus('idle')
    setUploadErro('')
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!form.nome.trim()) { setErro('Informe seu nome completo.'); return }
    if (form.cpf.replace(/\D/g, '').length < 11) { setErro('Informe um CPF válido.'); return }
    if (!comprovanteUrl) { setErro('Envie o comprovante de residência para continuar.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/beneficiarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cpf: form.cpf.replace(/\D/g, ''),
          comprovanteUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao enviar cadastro.'); return }
      router.push('/cadastro/sucesso')
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <header className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/" className="text-white text-xl leading-none">‹</Link>
        <span className="text-white text-sm font-semibold">Fazer cadastro</span>
      </header>

      <form onSubmit={enviar} className="p-5 max-w-md mx-auto">
        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          Preencha seus dados. A equipe da igreja confirmará seu cadastro antes da próxima entrega.
        </p>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">{erro}</div>
        )}

        {/* Dados pessoais */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-200">Seus dados</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Nome completo</label>
              <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="Seu nome completo" value={form.nome}
                onChange={e => set('nome', e.target.value)} autoComplete="name" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">CPF</label>
              <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="000.000.000-00" inputMode="numeric" value={form.cpf} maxLength={14}
                onChange={e => set('cpf', formatCPF(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">WhatsApp</label>
              <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="(19) 9 0000-0000" type="tel" value={form.telefone}
                onChange={e => set('telefone', formatPhone(e.target.value))} autoComplete="tel" />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-200">Endereço</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Rua e número</label>
              <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="Rua, número" value={form.endereco}
                onChange={e => set('endereco', e.target.value)} autoComplete="street-address" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Bairro</label>
              <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="Bairro" value={form.bairro}
                onChange={e => set('bairro', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Moradores */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-200">Pessoas na casa</p>
          <div className="grid grid-cols-2 gap-2.5">
            <Counter label="0 a 12 anos" value={form.criancas} onChange={v => set('criancas', v)} />
            <Counter label="13 a 17 anos" value={form.adolescentes} onChange={v => set('adolescentes', v)} />
            <Counter label="18 a 59 anos" value={form.adultos} onChange={v => set('adultos', v)} />
            <Counter label="60 ou mais" value={form.idosos} onChange={v => set('idosos', v)} />
          </div>
        </div>

        {/* Comprovante de residência */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pb-2 border-b border-slate-200">
            Comprovante de residência <span className="text-red-400">*</span>
          </p>
          <p className="text-xs text-slate-400 mb-3">
            Conta de luz, água, gás ou correspondência com seu endereço.
          </p>

          {/* Idle */}
          {uploadStatus === 'idle' && (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 rounded-xl p-7 flex flex-col items-center gap-2 hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <span className="text-4xl">📄</span>
              <p className="font-semibold text-slate-700 text-sm">Tirar foto ou escolher arquivo</p>
              <p className="text-xs text-slate-400 text-center leading-relaxed">
                No celular: tire uma foto do documento agora<br />
                ou selecione uma já salva na galeria
              </p>
            </button>
          )}

          {/* Uploading */}
          {uploadStatus === 'uploading' && (
            <div className="border-2 border-purple-200 bg-purple-50 rounded-xl p-7 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
              <p className="text-sm text-purple-700 font-medium">Enviando imagem…</p>
            </div>
          )}

          {/* Done */}
          {uploadStatus === 'done' && previewUrl && (
            <div className="border-2 border-green-200 rounded-xl overflow-hidden">
              <img src={previewUrl} alt="Comprovante" className="w-full h-52 object-cover" />
              <div className="px-4 py-3 bg-green-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-base">✅</span>
                  <p className="text-sm font-semibold text-green-800">Comprovante enviado</p>
                </div>
                <button type="button" onClick={removerComprovante}
                  className="text-xs text-slate-500 hover:text-red-500 underline transition-colors">
                  Trocar
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {uploadStatus === 'error' && (
            <div className="border-2 border-red-200 bg-red-50 rounded-xl p-4 space-y-3">
              <p className="text-sm text-red-700 font-medium">⚠️ {uploadErro}</p>
              <button type="button" onClick={() => { setUploadStatus('idle'); setUploadErro('') }}
                className="text-sm font-semibold underline text-red-600">
                Tentar novamente
              </button>
            </div>
          )}

          {/* Input oculto — aceita imagem de qualquer fonte (câmera ou galeria) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="hidden"
            onChange={handleArquivo}
          />
        </div>

        <button type="submit" disabled={loading || uploadStatus === 'uploading'}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
          style={{ background: 'var(--roxo)' }}>
          {loading ? 'Enviando…' : 'Enviar cadastro'}
        </button>
      </form>
    </main>
  )
}
