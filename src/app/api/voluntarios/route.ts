// src/app/api/voluntarios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cleanCPF, cpfValido } from '@/lib/utils'
import { rateLimitExcedido } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca') || ''
  const cpfBusca = cleanCPF(busca)

  const voluntarios = await prisma.voluntario.findMany({
    where: busca ? {
      OR: [
        { nome: { contains: busca, mode: 'insensitive' } },
        { telefone: { contains: busca } },
        ...(cpfBusca ? [{ cpf: { contains: cpfBusca } }] : []),
      ],
    } : undefined,
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(voluntarios)
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconhecido'
  if (rateLimitExcedido(ip)) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }, { status: 429 })
  }

  const body = await req.json()
  const { nome, cpf, telefone } = body

  if (!nome?.trim() || !telefone?.trim()) {
    return NextResponse.json({ error: 'Nome e telefone são obrigatórios.' }, { status: 400 })
  }

  const cpfLimpo = cleanCPF(cpf || '')
  if (!cpfValido(cpfLimpo)) {
    return NextResponse.json({ error: 'Informe um CPF válido.' }, { status: 400 })
  }

  const existente = await prisma.voluntario.findUnique({ where: { cpf: cpfLimpo } })
  if (existente) {
    return NextResponse.json({ error: 'Este CPF já está cadastrado como voluntário.' }, { status: 409 })
  }

  const voluntario = await prisma.voluntario.create({
    data: { nome: nome.trim(), cpf: cpfLimpo, telefone: telefone.trim() },
  })

  return NextResponse.json(voluntario, { status: 201 })
}
