// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email, ativo: true },
        })

        if (!admin) return null

        const senhaCorreta = await bcrypt.compare(credentials.senha, admin.senha)
        if (!senhaCorreta) return null

        return {
          id: admin.id,
          name: admin.nome,
          email: admin.email,
          superAdmin: admin.superAdmin,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.superAdmin = (user as any).superAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).superAdmin = token.superAdmin
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas
  },
}
