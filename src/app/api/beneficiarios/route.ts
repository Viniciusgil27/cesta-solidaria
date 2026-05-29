// src/app/api/beneficiarios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca') || ''
  const entregaId = searchParams.get('entregaId')

  const beneficiarios = await prisma.beneficiario.findMany({
    where: {
      ativo: true,
      statusCadastro: 'APROVADO',
      OR: busca ? [
        { nome: { contains: busca, mode: 'insensitive' } },
        { cpf: { contains: busca } },
      ] : undefined,
    },
    orderBy: { nome: 'asc' },
  })

  let retiradosIds = new Set<string>()
  if (entregaId) {
    const retiradas = await prisma.retirada.findMany({
      where: { entregaId },
      select: { beneficiarioId: true },
    })
    retiradosIds = new Set(retiradas.map((r) => r.beneficiarioId))
  }

  const resultado = beneficiarios.map((b) => ({
    ...b,
    jaRetirou: entregaId ? retiradosIds.has(b.id) : undefined,
  }))

  return NextResponse.json(resultado)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nome, cpf, telefone, endereco, bairro, criancas, adolescentes, adultos, idosos } = body

  if (!nome || !cpf) return NextResponse.json({ error: 'Nome e CPF são obrigatórios' }, { status: 400 })

  const cpfLimpo = cpf.replace(/\D/g, '')
  const existente = await prisma.beneficiario.findUnique({ where: { cpf: cpfLimpo } })
  if (existente) return NextResponse.json({ error: 'CPF já cadastrado' }, { status: 409 })

  const session = await getServerSession(authOptions)
  const statusCadastro = session ? 'APROVADO' : 'PENDENTE'

  const beneficiario = await prisma.beneficiario.create({
    data: { nome, cpf: cpfLimpo, telefone, endereco, bairro, criancas: criancas || 0, adolescentes: adolescentes || 0, adultos: adultos || 0, idosos: idosos || 0, statusCadastro },
  })

  return NextResponse.json(beneficiario, { status: 201 })
}
