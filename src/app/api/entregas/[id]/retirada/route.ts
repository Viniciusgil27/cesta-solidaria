// src/app/api/entregas/[id]/retirada/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { beneficiarioId } = await req.json()
  if (!beneficiarioId) return NextResponse.json({ error: 'beneficiarioId obrigatório' }, { status: 400 })

  // Verifica se já retirou
  const existente = await prisma.retirada.findUnique({
    where: { beneficiarioId_entregaId: { beneficiarioId, entregaId: params.id } },
  })
  if (existente) return NextResponse.json({ error: 'Já retirou nesta entrega' }, { status: 409 })

  const retirada = await prisma.retirada.create({
    data: { beneficiarioId, entregaId: params.id },
    include: { beneficiario: true },
  })

  return NextResponse.json(retirada, { status: 201 })
}
