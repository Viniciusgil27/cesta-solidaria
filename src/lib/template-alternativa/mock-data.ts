// Dados fictícios para o protótipo visual "template-alternativa".
// Nenhum dado real de beneficiário/voluntário é usado aqui — nomes, CPFs,
// telefones e endereços são inventados só para preencher as telas de exemplo.
// CPFs já nascem no formato mascarado usado nas telas públicas.

export type StatusCadastro = 'PENDENTE' | 'APROVADO' | 'REJEITADO'
export type StatusVoluntario = 'ATIVO' | 'INATIVO'
export type EntregaStatus = 'ATIVA' | 'ENCERRADA'

export interface MockBeneficiario {
  id: string
  nome: string
  cpf: string // dígitos fictícios, formatados sob demanda por lib/template-alternativa/format
  telefone: string
  endereco: string
  bairro: string
  criancas: number
  adolescentes: number
  adultos: number
  idosos: number
  statusCadastro: StatusCadastro
  temComprovante: boolean
  motivoRejeicao?: string
  criadoEm: string
}

export interface MockVoluntario {
  id: string
  nome: string
  cpf: string
  telefone: string
  status: StatusVoluntario
  observacoes?: string
  criadoEm: string
}

export interface MockEntrega {
  id: string
  data: string
  local: string
  status: EntregaStatus
  totalRetiradas: number
}

export interface MockAdmin {
  id: string
  nome: string
  email: string
  superAdmin: boolean
  ativo: boolean
}

export const mockBeneficiariosAprovados: MockBeneficiario[] = [
  {
    id: 'benef-1', nome: 'Maria de Fátima Souza', cpf: '52814936700',
    telefone: '(19) 9 8123-4567', endereco: 'Rua das Palmeiras, 214', bairro: 'Jardim Esperança',
    criancas: 2, adolescentes: 1, adultos: 2, idosos: 0,
    statusCadastro: 'APROVADO', temComprovante: true, criadoEm: '2026-07-02T14:20:00',
  },
  {
    id: 'benef-2', nome: 'José Carlos Pereira', cpf: '31047258611',
    telefone: '(19) 9 9456-1122', endereco: 'Av. Brasil, 890', bairro: 'Vila São José',
    criancas: 0, adolescentes: 0, adultos: 1, idosos: 1,
    statusCadastro: 'APROVADO', temComprovante: true, criadoEm: '2026-06-28T09:05:00',
  },
  {
    id: 'benef-3', nome: 'Ana Paula Ribeiro', cpf: '68930147255',
    telefone: '(19) 9 7788-3344', endereco: 'Rua Sete de Setembro, 55', bairro: 'Centro',
    criancas: 3, adolescentes: 0, adultos: 1, idosos: 0,
    statusCadastro: 'APROVADO', temComprovante: true, criadoEm: '2026-06-20T11:40:00',
  },
]

export const mockBeneficiariosPendentes: MockBeneficiario[] = [
  {
    id: 'benef-4', nome: 'Roberto Almeida Santos', cpf: '77215893044',
    telefone: '(19) 9 6612-7890', endereco: 'Rua das Acácias, 120', bairro: 'Jardim Esperança',
    criancas: 1, adolescentes: 2, adultos: 2, idosos: 0,
    statusCadastro: 'PENDENTE', temComprovante: true, criadoEm: '2026-07-29T16:10:00',
  },
  {
    id: 'benef-5', nome: 'Luzia Martins Costa', cpf: '40982613755',
    telefone: '(19) 9 5544-2211', endereco: 'Rua Dom Pedro II, 340', bairro: 'Vila São José',
    criancas: 0, adolescentes: 1, adultos: 1, idosos: 1,
    statusCadastro: 'PENDENTE', temComprovante: false, criadoEm: '2026-07-30T08:45:00',
  },
]

export const mockBeneficiariosRejeitados: MockBeneficiario[] = [
  {
    id: 'benef-6', nome: 'Carlos Eduardo Lima', cpf: '19834762588',
    telefone: '(19) 9 3311-9900', endereco: 'Rua Amazonas, 78', bairro: 'Centro',
    criancas: 0, adolescentes: 0, adultos: 1, idosos: 0,
    statusCadastro: 'REJEITADO', temComprovante: true,
    motivoRejeicao: 'Comprovante de residência ilegível. Envie uma foto mais nítida.',
    criadoEm: '2026-07-15T10:00:00',
  },
]

export const mockBeneficiarios: MockBeneficiario[] = [
  ...mockBeneficiariosAprovados,
  ...mockBeneficiariosPendentes,
  ...mockBeneficiariosRejeitados,
]

export const mockVoluntarios: MockVoluntario[] = [
  { id: 'vol-1', nome: 'Fernanda Oliveira', cpf: '85217463099', telefone: '(19) 9 8811-2233', status: 'ATIVO', observacoes: 'Ajuda na organização das cestas.', criadoEm: '2026-05-10T10:00:00' },
  { id: 'vol-2', nome: 'Marcos Vinícius Rocha', cpf: '63498271056', telefone: '(19) 9 7722-4455', status: 'ATIVO', criadoEm: '2026-05-18T09:30:00' },
  { id: 'vol-3', nome: 'Patrícia Gomes', cpf: '20758349166', telefone: '(19) 9 6633-1188', status: 'INATIVO', observacoes: 'Mudou-se de cidade.', criadoEm: '2026-03-02T15:00:00' },
]

export const mockEntregaAtiva: MockEntrega = {
  id: 'entrega-atual', data: '2026-08-15T09:00:00', local: 'Salão da Igreja — Rua Central, 100',
  status: 'ATIVA', totalRetiradas: 2,
}

export const mockHistoricoEntregas: MockEntrega[] = [
  { id: 'entrega-1', data: '2026-07-11T09:00:00', local: 'Salão da Igreja — Rua Central, 100', status: 'ENCERRADA', totalRetiradas: 28 },
  { id: 'entrega-2', data: '2026-06-13T09:00:00', local: 'Salão da Igreja — Rua Central, 100', status: 'ENCERRADA', totalRetiradas: 31 },
  { id: 'entrega-3', data: '2026-05-09T09:00:00', local: 'Praça do Bairro Jardim Esperança', status: 'ENCERRADA', totalRetiradas: 24 },
]

export const mockConfirmadosSessao = [
  { nome: 'Maria de Fátima Souza', cpf: '528.***.***-00' },
  { nome: 'José Carlos Pereira', cpf: '310.***.***-11' },
]

export const mockAdmins: MockAdmin[] = [
  { id: 'admin-1', nome: 'Pastor Eliseu Nogueira', email: 'eliseu@altvida.org.br', superAdmin: true, ativo: true },
  { id: 'admin-2', nome: 'Camila Duarte', email: 'camila@altvida.org.br', superAdmin: false, ativo: true },
]

export const mockAdminLogado = { nome: 'Camila Duarte' }
