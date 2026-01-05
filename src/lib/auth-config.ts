import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { verifyPassword, findUserByEmail, findOrCreateUserByEmail } from './auth'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await findUserByEmail(credentials.email)

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Handle initial sign in
      if (account && user) {
        // Check if this is a new OAuth sign in
        if (account.provider !== 'credentials') {
          // Try to find existing user by email
          const existingUser = await findUserByEmail(user.email!)

          if (existingUser) {
            // Link the OAuth account to existing user
            token.id = existingUser.id
          } else {
            // Create new user for OAuth
            const newUser = await findOrCreateUserByEmail(user.email!, user.name!)
            token.id = newUser.id
          }
        } else {
          // Credentials provider
          const dbUser = await findUserByEmail(user.email!)
          token.id = dbUser!.id
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
