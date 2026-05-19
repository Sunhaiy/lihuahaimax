import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },

  pages: {
    signIn: '/admin/login',
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      if (isOnDashboard) return isLoggedIn
      return true
    },

    jwt({ token, user }) {
      if (user) {
        token.role = 'admin'
        token.id = user.id
      }
      return token
    },

    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        // @ts-expect-error custom field
        session.user.role = token.role
      }
      return session
    },
  },

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const { authenticateAdmin } = await import('@/lib/auth/adminCredentials')
        return authenticateAdmin(email, password)
      },
    }),
  ],
}
