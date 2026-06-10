// src/app/api/beneficiarios/[id]/rejeitar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const motivo = body?.motivo?.trim()
  if (!motivo) {
    return NextResponse.json({ error: 'Informe o motivo da rejeição.' }, { status: 400 })
  }

  const beneficiario = await prisma.beneficiario.findUnique({ where: { id: params.id } })
  if (!beneficiario) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const atualizado = await prisma.beneficiario.update({
    where: { id: params.id },
    data: {
      statusCadastro: 'REJEITADO',
      ativo: false,
      motivoRejeicao: motivo,
      rejeitadoEm: new Date(),
    },
  })

  return NextResponse.json(atualizado)
}
