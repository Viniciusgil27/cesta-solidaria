// src/app/api/voluntarios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cleanCPF, cpfValido } from '@/lib/utils'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const voluntario = await prisma.voluntario.findUnique({ where: { id: params.id } })
  if (!voluntario) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(voluntario)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { nome, cpf, telefone, status, observacoes } = body

  let cpfLimpo: string | undefined
  if (cpf !== undefined) {
    cpfLimpo = cleanCPF(cpf)
    if (!cpfValido(cpfLimpo)) {
      return NextResponse.json({ error: 'Informe um CPF válido.' }, { status: 400 })
    }
    const dup = await prisma.voluntario.findFirst({ where: { cpf: cpfLimpo, NOT: { id: params.id } } })
    if (dup) return NextResponse.json({ error: 'CPF já cadastrado em outro voluntário' }, { status: 409 })
  }

  if (status !== undefined && status !== 'ATIVO' && status !== 'INATIVO') {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const voluntario = await prisma.voluntario.update({
    where: { id: params.id },
    data: {
      ...(nome !== undefined && { nome }),
      ...(cpfLimpo !== undefined && { cpf: cpfLimpo }),
      ...(telefone !== undefined && { telefone }),
      ...(status !== undefined && { status }),
      ...(observacoes !== undefined && { observacoes: observacoes || null }),
    },
  })
  return NextResponse.json(voluntario)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await prisma.voluntario.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
