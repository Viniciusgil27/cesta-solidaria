// src/app/api/beneficiarios/pendentes/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const pendentes = await prisma.beneficiario.findMany({
    where: { statusCadastro: 'PENDENTE' },
    orderBy: { criadoEm: 'asc' },
  })

  return NextResponse.json(pendentes)
}
