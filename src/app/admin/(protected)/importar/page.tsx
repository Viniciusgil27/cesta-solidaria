'use client'
// src/app/admin/(protected)/importar/page.tsx
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Linha = { nome: string; cpf: string; telefone?: string; endereco?: string; bairro?: string }

export default function ImportarPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [nomeArquivo, setNomeArquivo] = useState('')
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState<{ adicionados: number; atualizados: number; ignorados: number } | null>(null)
  const [erro, setErro] = useState('')

  async function lerArquivo(file: File) {
    setErro('')
    setResultado(null)
    if (!file) return
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
    const parsed: Linha[] = rows.map(r => ({
      nome: (r['nome'] || r['Nome'] || r['NOME'] || '').toString().trim(),
      cpf: (r['cpf'] || r['CPF'] || '').toString().trim(),
      telefone: (r['telefone'] || r['Telefone'] || r['TELEFONE'] || '').toString().trim() || undefined,
      endereco: (r['endereco'] || r['Endereço'] || r['endereco'] || '').toString().trim() || undefined,
      bairro: (r['bairro'] || r['Bairro'] || r['BAIRRO'] || '').toString().trim() || undefined,
    }))
    setLinhas(parsed)
    setNomeArquivo(file.name)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) lerArquivo(file)
  }

  async function importar() {
    if (!linhas.length) return
    setImportando(true)
    setErro('')
    const res = await fetch('/api/beneficiarios/importar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registros: linhas }),
    })
    setImportando(false)
    if (!res.ok) { setErro('Erro ao importar. Verifique o arquivo.'); return }
    const data = await res.json()
    setResultado(data)
    setLinhas([])
    setNomeArquivo('')
  }

  const COLUNAS: (keyof Linha)[] = ['nome', 'cpf', 'telefone', 'endereco', 'bairro']
  const preview = linhas.slice(0, 8)

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/admin" className="text-white text-xl leading-none">‹</Link>
        <p className="text-white text-sm font-semibold">Importar Excel</p>
      </header>

      <div className="p-5 max-w-lg mx-auto space-y-4">

        {/* Aviso de formato */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-700 leading-relaxed">
          ℹ️ O Excel deve ter colunas: <strong>nome</strong>, <strong>cpf</strong>, <strong>telefone</strong>, <strong>endereco</strong>, <strong>bairro</strong>.
          CPFs novos serão adicionados; CPFs existentes serão atualizados.
        </div>

        {/* Resultado de importação */}
        {resultado && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="font-semibold text-green-800 text-sm mb-1">✅ Importação concluída!</p>
            <p className="text-xs text-green-700 leading-relaxed">
              {resultado.adicionados} novo{resultado.adicionados !== 1 ? 's' : ''} cadastro{resultado.adicionados !== 1 ? 's' : ''} · {' '}
              {resultado.atualizados} atualizado{resultado.atualizados !== 1 ? 's' : ''} · {' '}
              {resultado.ignorados} ignorado{resultado.ignorados !== 1 ? 's' : ''}
            </p>
            <button onClick={() => router.push('/admin/beneficiarios')}
              className="mt-3 text-xs font-semibold text-green-700 underline">
              Ver beneficiários →
            </button>
          </div>
        )}

        {erro && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{erro}</div>}

        {/* Drop zone */}
        {!linhas.length && !resultado && (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
              drag ? 'border-purple-400 bg-purple-50' : 'border-slate-300 bg-white hover:border-purple-300 hover:bg-purple-50'
            }`}>
            <p className="text-4xl mb-3">📂</p>
            <p className="font-semibold text-slate-700 text-sm mb-1">Clique ou arraste o arquivo aqui</p>
            <p className="text-xs text-slate-400">.xlsx ou .xls</p>
          </div>
        )}

        <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
          onChange={e => { if (e.target.files?.[0]) lerArquivo(e.target.files[0]); e.target.value = '' }} />

        {/* Preview */}
        {linhas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {nomeArquivo} — {linhas.length} registro{linhas.length !== 1 ? 's' : ''}
              </p>
              <button onClick={() => { setLinhas([]); setNomeArquivo('') }}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                ✕ Limpar
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'var(--roxo-bg)' }}>
                      {COLUNAS.map(c => (
                        <th key={c} className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-xs"
                          style={{ color: 'var(--roxo-med)' }}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        {COLUNAS.map(c => (
                          <td key={c} className="px-3 py-2 text-slate-700 max-w-[120px] truncate">{row[c] || '—'}</td>
                        ))}
                      </tr>
                    ))}
                    {linhas.length > 8 && (
                      <tr className="border-t border-slate-100">
                        <td colSpan={5} className="px-3 py-2 text-center text-slate-400 italic">
                          … e mais {linhas.length - 8} registros
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <button onClick={importar} disabled={importando}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
              style={{ background: 'var(--roxo)' }}>
              {importando ? 'Importando…' : `Importar ${linhas.length} registro${linhas.length !== 1 ? 's' : ''} para a base`}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
