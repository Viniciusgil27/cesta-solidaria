// src/app/api/entregas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { acao } = await req.json()

  if (acao === 'encerrar') {
    const entrega = await prisma.entrega.update({
      where: { id: params.id },
      data: { status: 'ENCERRADA', encerradaEm: new Date() },
    })
    return NextResponse.json(entrega)
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}
