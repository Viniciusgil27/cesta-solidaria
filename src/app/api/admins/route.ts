// src/app/api/admins/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admins = await prisma.admin.findMany({
    select: { id: true, nome: true, email: true, superAdmin: true, ativo: true, criadoEm: true },
    orderBy: { criadoEm: 'asc' },
  })

  return NextResponse.json(admins)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Só super admin pode criar outros admins
  const usuarioAtual = await prisma.admin.findUnique({ where: { email: session.user?.email! } })
  if (!usuarioAtual?.superAdmin) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { nome, email, senha } = await req.json()
  if (!nome || !email || !senha) return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
  if (senha.length < 8) return NextResponse.json({ error: 'Senha deve ter pelo menos 8 caracteres' }, { status: 400 })

  const existente = await prisma.admin.findUnique({ where: { email } })
  if (existente) return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })

  const senhaHash = await bcrypt.hash(senha, 12)
  const admin = await prisma.admin.create({
    data: { nome, email, senha: senhaHash, superAdmin: false, criadoPor: usuarioAtual.id },
    select: { id: true, nome: true, email: true, superAdmin: true, ativo: true, criadoEm: true },
  })

  return NextResponse.json(admin, { status: 201 })
}
