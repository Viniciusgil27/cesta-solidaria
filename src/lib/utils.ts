// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCPF(cpf: string): string {
  const nums = cpf.replace(/\D/g, '').slice(0, 11)
  return nums
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

export function maskCPF(cpf: string): string {
  const nums = cleanCPF(cpf)
  if (nums.length !== 11) return cpf
  return `${nums.slice(0, 3)}.***.***-${nums.slice(9, 11)}`
}

export function cpfValido(cpf: string): boolean {
  const nums = cleanCPF(cpf)
  if (nums.length !== 11 || /^(\d)\1{10}$/.test(nums)) return false

  const digito = (base: string) => {
    let soma = 0
    for (let i = 0; i < base.length; i++) soma += parseInt(base[i]) * (base.length + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  return digito(nums.slice(0, 9)) === parseInt(nums[9]) && digito(nums.slice(0, 10)) === parseInt(nums[10])
}

export function formatPhone(phone: string): string {
  const nums = phone.replace(/\D/g, '').slice(0, 11)
  if (nums.length > 10)
    return nums.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4')
  return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  const dataPart = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' })
  const horaPart = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
  return `${dataPart} às ${horaPart}`
}

export function totalMoradores(b: { criancas: number; adolescentes: number; adultos: number; idosos: number }) {
  return b.criancas + b.adolescentes + b.adultos + b.idosos
}

export function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}
