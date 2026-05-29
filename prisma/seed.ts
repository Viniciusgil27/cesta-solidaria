// prisma/seed.ts
// Rode: npx ts-node prisma/seed.ts
// Cria o super admin inicial. Troque o email e senha antes de rodar.

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const senhaHash = await bcrypt.hash('Morumbis@1234', 12)

  const admin = await prisma.admin.upsert({
    where: { email: 'viny.gil27@gmail.com' },
    update: { senha: senhaHash },
    create: {
      nome: 'Vinicius Sousa',
      email: 'viny.gil27@gmail.com',
      senha: senhaHash,
      superAdmin: true,
    },
  })

  console.log('✅ Super admin criado:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
