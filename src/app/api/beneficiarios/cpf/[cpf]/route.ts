// src/app/api/beneficiarios/cpf/[cpf]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { cpf: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const cpfLimpo = params.cpf.replace(/\D/g, '')
  const entregaId = new URL(req.url).searchParams.get('entregaId')

  const beneficiario = await prisma.beneficiario.findUnique({
    where: { cpf: cpfLimpo, ativo: true },
  })

  if (!beneficiario) return NextResponse.json({ status: 'nao_cadastrado' }, { status: 200 })

  const jaRetirou = entregaId
    ? (await prisma.retirada.count({ where: { beneficiarioId: beneficiario.id, entregaId } })) > 0
    : false

  return NextResponse.json({
    status: jaRetirou ? 'ja_retirou' : 'pode_retirar',
    beneficiario,
  })
}
