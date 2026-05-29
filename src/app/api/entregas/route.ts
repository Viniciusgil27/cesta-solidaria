// src/app/api/entregas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const entregas = await prisma.entrega.findMany({
    orderBy: { criadoEm: 'desc' },
    include: { _count: { select: { retiradas: true } } },
  })

  const totalBeneficiarios = await prisma.beneficiario.count({ where: { ativo: true } })

  return NextResponse.json(
    entregas.map((e) => ({
      ...e,
      totalRetiraram: e._count.retiradas,
      totalCadastrados: totalBeneficiarios,
      _count: undefined,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, local } = await req.json()
  if (!data || !local) return NextResponse.json({ error: 'Data e local são obrigatórios' }, { status: 400 })

  // Encerra entrega ativa anterior automaticamente
  await prisma.entrega.updateMany({ where: { status: 'ATIVA' }, data: { status: 'ENCERRADA', encerradaEm: new Date() } })

  const entrega = await prisma.entrega.create({ data: { data: new Date(data), local, status: 'ATIVA' } })
  return NextResponse.json(entrega, { status: 201 })
}
