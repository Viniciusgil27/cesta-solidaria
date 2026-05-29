// src/app/api/beneficiarios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const b = await prisma.beneficiario.findUnique({ where: { id: params.id } })
  if (!b) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(b)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { nome, cpf, telefone, endereco, bairro, criancas, adolescentes, adultos, idosos } = body

  const cpfLimpo = cpf?.replace(/\D/g, '')

  // Verifica duplicata de CPF em outro registro
  if (cpfLimpo) {
    const dup = await prisma.beneficiario.findFirst({ where: { cpf: cpfLimpo, NOT: { id: params.id } } })
    if (dup) return NextResponse.json({ error: 'CPF já cadastrado em outro beneficiário' }, { status: 409 })
  }

  const b = await prisma.beneficiario.update({
    where: { id: params.id },
    data: { nome, cpf: cpfLimpo, telefone, endereco, bairro, criancas, adolescentes, adultos, idosos },
  })
  return NextResponse.json(b)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Soft delete — mantém histórico
  await prisma.beneficiario.update({ where: { id: params.id }, data: { ativo: false } })
  return NextResponse.json({ ok: true })
}
