// src/app/api/admins/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function verificarSuperAdmin(email: string) {
  const admin = await prisma.admin.findUnique({ where: { email } })
  return admin?.superAdmin === true
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!(await verificarSuperAdmin(session.user?.email!)))
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const body = await req.json()

  // Alterar senha
  if (body.novaSenha) {
    if (body.novaSenha.length < 8) return NextResponse.json({ error: 'Senha muito curta' }, { status: 400 })
    const hash = await bcrypt.hash(body.novaSenha, 12)
    await prisma.admin.update({ where: { id: params.id }, data: { senha: hash } })
    return NextResponse.json({ ok: true })
  }

  // Ativar / desativar
  if (typeof body.ativo === 'boolean') {
    const admin = await prisma.admin.update({
      where: { id: params.id },
      data: { ativo: body.ativo },
      select: { id: true, nome: true, email: true, superAdmin: true, ativo: true },
    })
    return NextResponse.json(admin)
  }

  return NextResponse.json({ error: 'Nenhuma alteração' }, { status: 400 })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!(await verificarSuperAdmin(session.user?.email!)))
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  // Impede remover o próprio super admin
  const alvo = await prisma.admin.findUnique({ where: { id: params.id } })
  if (alvo?.superAdmin) return NextResponse.json({ error: 'Não é possível remover o super admin' }, { status: 400 })

  await prisma.admin.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
