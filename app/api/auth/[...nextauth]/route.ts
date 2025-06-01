import NextAuth from "next-auth"
import { NextAuthOptions, DefaultSession, DefaultUser } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Extend the built-in session and user types
declare module "next-auth" {
  interface Session extends DefaultSession {
    backendToken?: string;
  }
  interface User extends DefaultUser {
    backendToken?: string;
  }
}

// Get the base URL for callbacks
const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call your backend to handle authentication
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()
          if (!data.token) {
            return null
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            backendToken: data.token,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.backendToken = user.backendToken
      }
      return token
    },
    async session({ session, token }) {
      if (token.backendToken) {
        session.backendToken = token.backendToken as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// TODO: Replace the placeholder client IDs and secrets with real values in your .env file.
