// src/app/api/upload/comprovante/route.ts
import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!
const BUCKET = 'comprovantes'

const TIPOS_PERMITIDOS = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const TAMANHO_MAX = 10 * 1024 * 1024 // 10 MB

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const arquivo = formData.get('arquivo') as File | null

  if (!arquivo) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
  }

  // iOS converte HEIC → JPEG automaticamente antes do upload,
  // então 'image/jpeg' cobre fotos tiradas no iPhone.
  if (!TIPOS_PERMITIDOS.has(arquivo.type)) {
    return NextResponse.json(
      { error: 'Formato não suportado. Use JPG, PNG ou WebP.' },
      { status: 400 }
    )
  }

  if (arquivo.size > TAMANHO_MAX) {
    return NextResponse.json(
      { error: 'Arquivo muito grande. Máximo 10 MB.' },
      { status: 400 }
    )
  }

  const ext = MIME_EXT[arquivo.type] ?? 'jpg'
  const nome = `${crypto.randomUUID()}.${ext}`
  const buffer = await arquivo.arrayBuffer()

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${nome}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': arquivo.type,
        'x-upsert': 'false',
      },
      body: buffer,
    }
  )

  if (!res.ok) {
    console.error('Supabase Storage error:', res.status, await res.text())
    return NextResponse.json(
      { error: 'Erro ao salvar imagem. Tente novamente.' },
      { status: 500 }
    )
  }

  const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${nome}`
  return NextResponse.json({ url })
}
