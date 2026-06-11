// src/lib/rateLimit.ts
// Limitador simples em memória, por IP. Suficiente para reduzir tentativas
// abusivas em endpoints públicos; não é compartilhado entre instâncias serverless.

const tentativas = new Map<string, { count: number; resetAt: number }>()

const JANELA_MS = 5 * 60 * 1000 // 5 minutos
const LIMITE = 10

export function rateLimitExcedido(chave: string): boolean {
  const agora = Date.now()
  const registro = tentativas.get(chave)

  if (!registro || agora > registro.resetAt) {
    tentativas.set(chave, { count: 1, resetAt: agora + JANELA_MS })
    return false
  }

  registro.count++
  return registro.count > LIMITE
}
