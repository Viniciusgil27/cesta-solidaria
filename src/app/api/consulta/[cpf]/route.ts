// src/app/api/consulta/[cpf]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cleanCPF, maskCPF } from '@/lib/utils'
import { rateLimitExcedido } from '@/lib/rateLimit'

export async function GET(req: NextRequest, { params }: { params: { cpf: string } }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconhecido'
  if (rateLimitExcedido(ip)) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
      { status: 429 }
    )
  }

  const cpfLimpo = cleanCPF(params.cpf)
  if (cpfLimpo.length !== 11) {
    return NextResponse.json({ status: 'nao_encontrado' })
  }

  const beneficiario = await prisma.beneficiario.findUnique({ where: { cpf: cpfLimpo } })

  if (!beneficiario) {
    return NextResponse.json({ status: 'nao_encontrado' })
  }

  if (beneficiario.statusCadastro === 'PENDENTE') {
    return NextResponse.json({ status: 'pendente' })
  }

  if (beneficiario.statusCadastro === 'REJEITADO') {
    return NextResponse.json({
      status: 'rejeitado',
      cpfMascarado: maskCPF(beneficiario.cpf),
      motivoRejeicao: beneficiario.motivoRejeicao,
      rejeitadoEm: beneficiario.rejeitadoEm,
    })
  }

  return NextResponse.json({
    status: 'aprovado',
    nome: beneficiario.nome,
    cpfMascarado: maskCPF(beneficiario.cpf),
    aprovadoEm: beneficiario.aprovadoEm,
  })
}
