// src/types/index.ts

export type AdminRole = 'super' | 'admin'

export interface AdminUser {
  id: string
  nome: string
  email: string
  superAdmin: boolean
}

export type StatusCadastro = 'PENDENTE' | 'APROVADO' | 'REJEITADO'

export interface Beneficiario {
  id: string
  nome: string
  cpf: string
  telefone?: string
  endereco?: string
  bairro?: string
  criancas: number
  adolescentes: number
  adultos: number
  idosos: number
  ativo: boolean
  statusCadastro: StatusCadastro
  criadoEm: string
  jaRetirou?: boolean
}

export interface Entrega {
  id: string
  data: string
  local: string
  status: 'ATIVA' | 'ENCERRADA'
  criadoEm: string
  encerradaEm?: string
  totalCadastrados?: number
  totalRetiraram?: number
}

export interface ResumoEntrega {
  entrega: Entrega
  totalCadastrados: number
  totalRetiraram: number
  totalNaoRetiraram: number
  percentualAtendidos: number
}
