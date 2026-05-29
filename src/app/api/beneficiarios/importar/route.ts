// src/app/api/beneficiarios/importar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { registros } = body as { registros: Array<{ nome: string; cpf: string; telefone?: string; endereco?: string }> }

  if (!registros?.length) return NextResponse.json({ error: 'Nenhum registro enviado' }, { status: 400 })

  let adicionados = 0
  let atualizados = 0
  let ignorados = 0

  for (const r of registros) {
    const cpfLimpo = (r.cpf || '').replace(/\D/g, '')
    if (!r.nome || !cpfLimpo) { ignorados++; continue }

    const existente = await prisma.beneficiario.findUnique({ where: { cpf: cpfLimpo } })

    if (existente) {
      await prisma.beneficiario.update({
        where: { cpf: cpfLimpo },
        data: { nome: r.nome, telefone: r.telefone || existente.telefone, endereco: r.endereco || existente.endereco, ativo: true },
      })
      atualizados++
    } else {
      await prisma.beneficiario.create({
        data: { nome: r.nome, cpf: cpfLimpo, telefone: r.telefone, endereco: r.endereco, criancas: 0, adolescentes: 0, adultos: 0, idosos: 0 },
      })
      adicionados++
    }
  }

  return NextResponse.json({ adicionados, atualizados, ignorados })
}
