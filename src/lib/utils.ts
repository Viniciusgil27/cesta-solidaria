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

export function formatPhone(phone: string): string {
  const nums = phone.replace(/\D/g, '').slice(0, 11)
  if (nums.length > 10)
    return nums.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4')
  return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
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
