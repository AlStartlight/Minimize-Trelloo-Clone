import CredentialsProvider from "next-auth/providers/credentials"
import { createPrismaClient } from "@/lib/prisma"
import { compare } from "bcryptjs"
import type { AuthOptions } from "next-auth"

export function getAuthOptions(): AuthOptions {
  const prismaClient = createPrismaClient()

  return {
    session: {
      strategy: "jwt",
    },
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          try {
            if (!credentials?.email || !credentials?.password) return null

            const user = await prismaClient.user.findUnique({
              where: { email: credentials.email },
            })

            if (!user) return null

            const isValid = await compare(credentials.password, user.password)
            if (!isValid) return null

            return { id: user.id, email: user.email, name: user.name }
          } catch (error) {
            console.error("Authorization error:", error)
            return null
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
        }
        return token
      },
      async session({ session, token }) {
        if (token) {
          session.user = {
            ...session.user,
            id: token.id as string,
            email: token.email as string,
            name: token.name as string
          }
        }
        return session
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
  }
}
